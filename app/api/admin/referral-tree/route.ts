import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const raffleId = req.nextUrl.searchParams.get("raffleId");
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  // All users with tickets in this raffle, including who referred them
  const participants = await prisma.user.findMany({
    where: { tickets: { some: { raffleId } } },
    select: {
      id: true,
      name: true,
      email: true,
      referredById: true,
      referredBy: { select: { id: true, name: true, email: true } },
      tickets: { where: { raffleId }, select: { ticketNum: true, isFree: true } },
      referralShares: { where: { raffleId }, select: { method: true, createdAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Also get top referrer shares count
  const shares = await prisma.referralShare.findMany({
    where: { raffleId },
    select: { userId: true, method: true, createdAt: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ participants, shares });
}
