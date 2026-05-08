import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { raffleId, quantity } = await req.json();
  if (!raffleId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle || raffle.status !== "active") {
    return NextResponse.json({ error: "Raffle not found or not active." }, { status: 404 });
  }

  const available = raffle.totalTickets - raffle.soldTickets;
  if (quantity > available) {
    return NextResponse.json({ error: `Only ${available} tickets remaining.` }, { status: 400 });
  }

  const amount = Math.round(quantity * raffle.ticketPrice * 100); // cents

  // Create pending order
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      raffleId,
      quantity,
      amount: quantity * raffle.ticketPrice,
      status: "pending",
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${raffle.carYear} ${raffle.carMake} ${raffle.carModel} Raffle Ticket${quantity > 1 ? "s" : ""}`,
            description: `${quantity} ticket${quantity > 1 ? "s" : ""} — Taxes & fees covered by American Raffle`,
          },
          unit_amount: Math.round(raffle.ticketPrice * 100),
        },
        quantity,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/account?success=1&orderId=${order.id}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/raffle?cancelled=1`,
    metadata: {
      orderId: order.id,
      userId: session.user.id,
      raffleId,
      quantity: String(quantity),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
