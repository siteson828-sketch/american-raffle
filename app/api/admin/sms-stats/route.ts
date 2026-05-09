import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sentToday, sentMonth, allLogs, optOutCount, optInCount] = await Promise.all([
    prisma.smsLog.count({ where: { sentAt: { gte: todayStart } } }),
    prisma.smsLog.count({ where: { sentAt: { gte: monthStart } } }),
    prisma.smsLog.findMany({
      select: { status: true, cost: true, sentAt: true, type: true },
      orderBy: { sentAt: "desc" },
      take: 500,
    }),
    prisma.user.count({ where: { smsOptIn: false, smsOptOutAt: { not: null } } }),
    prisma.user.count({ where: { smsOptIn: true } }),
  ]);

  const totalSent = allLogs.length;
  const delivered = allLogs.filter((l) => l.status === "delivered").length;
  const failed = allLogs.filter((l) => ["failed", "undelivered"].includes(l.status)).length;
  const totalCost = allLogs.reduce((sum, l) => sum + (l.cost ?? 0), 0);
  const monthCost = allLogs
    .filter((l) => l.sentAt >= monthStart)
    .reduce((sum, l) => sum + (l.cost ?? 0), 0);

  const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : "0.0";
  const failureRate = totalSent > 0 ? ((failed / totalSent) * 100).toFixed(1) : "0.0";
  const optOutRate = optInCount + optOutCount > 0
    ? ((optOutCount / (optInCount + optOutCount)) * 100).toFixed(1)
    : "0.0";

  // Recent 20 logs for table
  const recentLogs = allLogs.slice(0, 20).map((l) => ({
    status: l.status,
    type: l.type,
    cost: l.cost,
    sentAt: l.sentAt,
  }));

  return NextResponse.json({
    sentToday,
    sentMonth,
    deliveryRate,
    failureRate,
    optOutRate,
    optInCount,
    optOutCount,
    totalCostAllTime: totalCost.toFixed(4),
    monthCost: monthCost.toFixed(4),
    recentLogs,
  });
}
