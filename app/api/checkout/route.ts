import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (!stripeKey || stripeKey.includes("placeholder") || !stripeKey.startsWith("sk_")) {
    return NextResponse.json(
      { error: "Payment is not configured yet. Please contact support." },
      { status: 503 }
    );
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

  // Derive base URL from the actual request origin so redirects always point to the right domain
  const origin =
    req.headers.get("origin") ??
    req.headers.get("referer")?.replace(/\/[^/]*$/, "") ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      raffleId,
      quantity,
      amount: quantity * raffle.ticketPrice,
      status: "pending",
    },
  });

  try {
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
      success_url: `${origin}/account?success=1&orderId=${order.id}`,
      cancel_url: `${origin}/raffle?cancelled=1`,
      customer_email: session.user.email ?? undefined,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        raffleId,
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    // Clean up the pending order so it doesn't leave orphaned records
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});

    const stripeErr = err as { message?: string; code?: string };
    console.error("Stripe checkout error:", stripeErr);
    return NextResponse.json(
      { error: stripeErr?.message ?? "Payment setup failed. Please try again." },
      { status: 500 }
    );
  }
}
