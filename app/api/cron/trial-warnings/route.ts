import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTrialWarningEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Vercel cron authorization
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  for (const daysLeft of [7, 1]) {
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() + daysLeft);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(23, 59, 59, 999);

    const users = await prisma.user.findMany({
      where: { trialEndsAt: { gte: windowStart, lte: windowEnd } },
    });

    for (const user of users) {
      if (user.email && user.trialEndsAt) {
        await sendTrialWarningEmail(user.email, user.name ?? "there", daysLeft, user.trialEndsAt);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
