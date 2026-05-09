import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailySummary } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeRaffle = await prisma.raffle.findFirst({ where: { status: "active" } });
  if (!activeRaffle) return NextResponse.json({ ok: true, skipped: "no active raffle" });

  // Tickets created today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [ticketsTodayCount, revenueToday, totalRevenue, adminUsers] = await Promise.all([
    prisma.ticket.count({ where: { raffleId: activeRaffle.id, createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      where: { raffleId: activeRaffle.id, status: "paid", createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { raffleId: activeRaffle.id, status: "paid" },
      _sum: { amount: true },
    }),
    prisma.user.findMany({ where: { role: "admin" } }),
  ]);

  const raffleName = `${activeRaffle.carYear} ${activeRaffle.carMake} ${activeRaffle.carModel}`;

  for (const admin of adminUsers) {
    if (admin.email) {
      await sendDailySummary(
        admin.email,
        admin.name ?? "Admin",
        raffleName,
        ticketsTodayCount,
        activeRaffle.soldTickets,
        activeRaffle.totalTickets,
        revenueToday._sum.amount ?? 0,
        totalRevenue._sum.amount ?? 0
      );
    }
  }

  return NextResponse.json({ ok: true, sent: adminUsers.length });
}
