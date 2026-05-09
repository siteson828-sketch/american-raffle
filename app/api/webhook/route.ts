import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

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

    // Handle referral bonus — check if this is their first purchase
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { orders: true } });
    const isFirstPurchase = user?.orders.filter((o: (typeof user.orders)[number]) => o.status === "paid").length === 1;

    if (isFirstPurchase && user?.referredById) {
      // Grant free ticket to referrer
      const refRaffle = await prisma.raffle.findFirst({ where: { status: "active" } });
      if (refRaffle) {
        const nextNum = refRaffle.soldTickets + qty + 1;
        // Create free order for referrer
        const freeOrder = await prisma.order.create({
          data: {
            userId: user.referredById,
            raffleId: refRaffle.id,
            quantity: 1,
            amount: 0,
            status: "paid",
          },
        });
        await prisma.ticket.create({
          data: {
            ticketNum: nextNum,
            raffleId: refRaffle.id,
            userId: user.referredById,
            orderId: freeOrder.id,
            isFree: true,
            freeReason: "referral",
          },
        });
        await prisma.raffle.update({
          where: { id: refRaffle.id },
          data: { soldTickets: { increment: 1 } },
        });
        // Also grant free ticket to new user
        const freeOrder2 = await prisma.order.create({
          data: {
            userId,
            raffleId: refRaffle.id,
            quantity: 1,
            amount: 0,
            status: "paid",
          },
        });
        await prisma.ticket.create({
          data: {
            ticketNum: nextNum + 1,
            raffleId: refRaffle.id,
            userId,
            orderId: freeOrder2.id,
            isFree: true,
            freeReason: "referral",
          },
        });
        await prisma.raffle.update({
          where: { id: refRaffle.id },
          data: { soldTickets: { increment: 1 } },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
