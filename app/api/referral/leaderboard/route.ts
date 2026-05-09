import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raffleId = req.nextUrl.searchParams.get("raffleId");
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const config = await prisma.referralConfig.findUnique({ where: { raffleId } });
  if (!config?.leaderboardEnabled) return NextResponse.json({ leaderboard: [], enabled: false });

  // Users who were referred AND have tickets in this raffle
  const referred = await prisma.user.findMany({
    where: {
      referredById: { not: null },
      tickets: { some: { raffleId } },
    },
    select: { referredById: true },
  });

  // Count by referrer
  const counts: Record<string, number> = {};
  for (const u of referred) {
    if (u.referredById) counts[u.referredById] = (counts[u.referredById] ?? 0) + 1;
  }

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  if (topIds.length === 0) return NextResponse.json({ leaderboard: [], enabled: true });

  const referrers = await prisma.user.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true },
  });

  const leaderboard = topIds.map((id, rank) => {
    const u = referrers.find((r) => r.id === id);
    return {
      rank: rank + 1,
      name: u?.name ? u.name.split(" ")[0] + (u.name.includes(" ") ? " " + u.name.split(" ")[1][0] + "." : "") : "Anonymous",
      count: counts[id],
    };
  });

  return NextResponse.json({ leaderboard, enabled: true, topReferrerBonus: config.topReferrerBonus });
}
