import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendWinnerNotification, sendDealerWinnerNotification } from "@/lib/email";
import { createHash, randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId } = await req.json();

  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    include: { drawingLog: true },
  });
  if (!raffle) return NextResponse.json({ error: "Raffle not found" }, { status: 404 });

  // Immutable: once a drawing is logged it cannot be redone
  if (raffle.drawingLog) {
    return NextResponse.json(
      { error: "This raffle already has a verified drawing on record and cannot be redrawn." },
      { status: 409 }
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { raffleId },
    include: { user: true },
    orderBy: { ticketNum: "asc" },
  });

  if (tickets.length === 0) {
    return NextResponse.json({ error: "No tickets in this raffle." }, { status: 400 });
  }

  // Cryptographically secure random selection
  const seed = randomBytes(32).toString("hex");
  const seedBuf = Buffer.from(seed, "hex");
  const randUint32 = seedBuf.readUInt32BE(0);
  const winningIndex = randUint32 % tickets.length;
  const winningTicket = tickets[winningIndex];
  const drawnAt = new Date();

  // SHA-256 over all deterministic inputs — publicly verifiable
  const verificationHash = createHash("sha256")
    .update(
      [raffleId, seed, winningTicket.ticketNum, tickets.length, drawnAt.toISOString()].join("|")
    )
    .digest("hex");

  // Atomic: update raffle + create immutable drawing log together
  await prisma.$transaction([
    prisma.raffle.update({
      where: { id: raffleId },
      data: { winnerId: winningTicket.userId, status: "completed" },
    }),
    prisma.drawingLog.create({
      data: {
        raffleId,
        winnerUserId: winningTicket.userId,
        winnerTicketNum: winningTicket.ticketNum,
        totalEntries: tickets.length,
        randomSeed: seed,
        method: "crypto_random",
        drawnAt,
        drawnByUserId: session.user.id,
        verificationHash,
      },
    }),
  ]);

  // Stripe Connect payout — best-effort, does not fail the drawing if it errors
  let stripeTransferId: string | null = null;
  if (raffle.dealerStripeAccountId && process.env.STRIPE_SECRET_KEY) {
    try {
      const revenue = await prisma.order.aggregate({
        where: { raffleId, status: "paid" },
        _sum: { amount: true },
      });
      const totalCents = Math.round((revenue._sum.amount ?? 0) * 100);
      const payoutCents = Math.round(totalCents * 0.9); // dealer gets 90%
      if (payoutCents > 0) {
        const transfer = await stripe.transfers.create({
          amount: payoutCents,
          currency: "usd",
          destination: raffle.dealerStripeAccountId,
          transfer_group: raffleId,
          metadata: { raffleId, verificationHash },
        });
        stripeTransferId = transfer.id;
        await prisma.drawingLog.update({
          where: { raffleId },
          data: {
            payoutTriggered: true,
            payoutAmount: payoutCents / 100,
            stripeTransferId,
          },
        });
      }
    } catch (err) {
      console.error("Stripe payout failed (drawing still recorded):", err);
    }
  }

  // Notify winner (fire-and-forget)
  if (winningTicket.user.email) {
    sendWinnerNotification(
      winningTicket.user.email,
      winningTicket.user.name ?? "Winner",
      `${raffle.carYear} ${raffle.carMake} ${raffle.carModel}`,
      winningTicket.ticketNum,
      verificationHash,
      raffleId
    ).catch(console.error);
  }

  // Notify dealer if email is stored on raffle (use dealerName as fallback contact key)
  // For now we look for an admin user to notify; dealers can be wired to their own accounts later
  const adminUser = await prisma.user.findFirst({ where: { role: "admin" } });
  if (adminUser?.email) {
    const log = await prisma.drawingLog.findUnique({ where: { raffleId } });
    sendDealerWinnerNotification(
      adminUser.email,
      raffle.dealerName ?? "Dealer",
      `${raffle.carYear} ${raffle.carMake} ${raffle.carModel}`,
      winningTicket.user.name ?? "Winner",
      winningTicket.user.email ?? "",
      winningTicket.ticketNum,
      log?.payoutAmount ?? null,
      stripeTransferId,
      verificationHash,
      raffleId
    ).catch(console.error);
  }

  return NextResponse.json({
    success: true,
    winner: { name: winningTicket.user.name, email: winningTicket.user.email },
    winningTicket: winningTicket.ticketNum,
    verificationHash,
    stripeTransferId,
  });
}
