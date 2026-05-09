import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST — create or retrieve a Stripe Connect onboarding link for a raffle's dealer
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId } = await req.json();
  const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle) return NextResponse.json({ error: "Raffle not found" }, { status: 404 });

  let accountId = raffle.dealerStripeAccountId;

  if (!accountId) {
    // Create a new Express account for this dealer
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      metadata: { raffleId, dealerName: raffle.dealerName ?? "" },
    });
    accountId = account.id;
    await prisma.raffle.update({
      where: { id: raffleId },
      data: { dealerStripeAccountId: accountId },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/admin/raffle/${raffleId}?connect=refresh`,
    return_url: `${baseUrl}/admin/raffle/${raffleId}?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url, accountId });
}

// GET — check Connect account status for a raffle
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const raffleId = req.nextUrl.searchParams.get("raffleId");
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle?.dealerStripeAccountId) {
    return NextResponse.json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(raffle.dealerStripeAccountId);
  return NextResponse.json({
    connected: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    accountId: account.id,
  });
}
