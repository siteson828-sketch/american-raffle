import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId, enabled, bonusTicketsPerRef, maxBonusPerUser, leaderboardEnabled, topReferrerBonus } = await req.json();
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const config = await prisma.referralConfig.upsert({
    where: { raffleId },
    create: { raffleId, enabled, bonusTicketsPerRef, maxBonusPerUser, leaderboardEnabled, topReferrerBonus },
    update: { enabled, bonusTicketsPerRef, maxBonusPerUser, leaderboardEnabled, topReferrerBonus },
  });

  return NextResponse.json({ ok: true, config });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const raffleId = req.nextUrl.searchParams.get("raffleId");
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const config = await prisma.referralConfig.findUnique({ where: { raffleId } });
  return NextResponse.json(config ?? {
    enabled: true, bonusTicketsPerRef: 1, maxBonusPerUser: 0, leaderboardEnabled: true, topReferrerBonus: 0,
  });
}
