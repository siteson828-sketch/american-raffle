import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata: Record<string, string>; payment_intent?: string };
    const { orderId, userId, raffleId, quantity } = session.metadata;
    const qty = parseInt(quantity);

    // Mark order paid
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "paid", stripePaymentId: session.payment_intent as string },
    });

    // Get current sold count to assign ticket numbers
    const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
    if (!raffle) return NextResponse.json({ ok: true });

    const startNum = raffle.soldTickets + 1;

    // Create tickets
    const tickets = Array.from({ length: qty }, (_, i) => ({
      ticketNum: startNum + i,
      raffleId,
      userId,
      orderId,
    }));
    await prisma.ticket.createMany({ data: tickets });

    // Update sold count
    await prisma.raffle.update({
      where: { id: raffleId },
      data: { soldTickets: { increment: qty } },
    });

    // Send payment confirmation email (fire-and-forget)
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { orders: true } });
    if (user?.email) {
      const ticketNums = Array.from({ length: qty }, (_, i) => startNum + i);
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      sendPaymentConfirmation(
        user.email,
        user.name ?? "there",
        qty,
        order?.amount ?? qty * raffle.ticketPrice,
        `${raffle.carYear} ${raffle.carMake} ${raffle.carModel}`,
        ticketNums
      ).catch(console.error);
    }

    // Handle referral bonus — check if this is their first purchase
    const isFirstPurchase = user?.orders.filter((o: (typeof user.orders)[number]) => o.status === "paid").length === 1;

    if (isFirstPurchase && user?.referredById) {
      const refRaffle = await prisma.raffle.findFirst({
        where: { status: "active" },
        include: { referralConfig: true },
      });
      if (refRaffle) {
        const cfg = refRaffle.referralConfig;
        // Skip if referral system disabled for this raffle
        if (cfg && !cfg.enabled) {
          // do nothing
        } else {
          const bonus = cfg?.bonusTicketsPerRef ?? 1;
          const maxBonus = cfg?.maxBonusPerUser ?? 0;

          // Check referrer's current bonus ticket count for this raffle (enforce max)
          const referrerBonusCount = maxBonus > 0
            ? await prisma.ticket.count({
                where: { raffleId: refRaffle.id, userId: user.referredById, isFree: true, freeReason: "referral" },
              })
            : 0;

          const referrerCanReceive = maxBonus === 0 || referrerBonusCount + bonus <= maxBonus;

          // Grant bonus tickets to referrer
          if (referrerCanReceive && bonus > 0) {
            const refStart = refRaffle.soldTickets + qty + 1;
            for (let b = 0; b < bonus; b++) {
              const fo = await prisma.order.create({
                data: { userId: user.referredById, raffleId: refRaffle.id, quantity: 1, amount: 0, status: "paid" },
              });
              await prisma.ticket.create({
                data: { ticketNum: refStart + b, raffleId: refRaffle.id, userId: user.referredById, orderId: fo.id, isFree: true, freeReason: "referral" },
              });
              await prisma.raffle.update({ where: { id: refRaffle.id }, data: { soldTickets: { increment: 1 } } });
            }
          }

          // Grant bonus tickets to new user (always 1 regardless of bonus setting)
          const newUserStart = refRaffle.soldTickets + qty + 1;
          const fo2 = await prisma.order.create({
            data: { userId, raffleId: refRaffle.id, quantity: 1, amount: 0, status: "paid" },
          });
          await prisma.ticket.create({
            data: { ticketNum: newUserStart, raffleId: refRaffle.id, userId, orderId: fo2.id, isFree: true, freeReason: "referral" },
          });
          await prisma.raffle.update({ where: { id: refRaffle.id }, data: { soldTickets: { increment: 1 } } });

          // Mark the most recent unConverted share from this referrer as converted
          const pendingShare = await prisma.referralShare.findFirst({
            where: { userId: user.referredById, raffleId: refRaffle.id, convertedUserId: null },
            orderBy: { createdAt: "desc" },
          });
          if (pendingShare) {
            await prisma.referralShare.update({
              where: { id: pendingShare.id },
              data: { convertedUserId: userId },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
