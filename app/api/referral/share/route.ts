import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { raffleId, method, phone } = await req.json();
  if (!raffleId || !method) {
    return NextResponse.json({ error: "raffleId and method required" }, { status: 400 });
  }

  await prisma.referralShare.create({
    data: { userId: session.user.id, raffleId, method },
  });

  if (method === "sms_twilio" && phone) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });

    if (user && raffle) {
      const referralUrl = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;
      const carName = `${raffle.carYear} ${raffle.carMake} ${raffle.carModel}`;
      const body = `I just entered to win a ${carName}! Enter here and we both get bonus tickets: ${referralUrl}`;

      const result = await sendSms({
        to: phone,
        userId: undefined, // recipient hasn't opted in yet — this is a peer-share, not a platform message
        body,
        type: "referral_share",
        raffleId,
      });

      if (!result.ok) {
        return NextResponse.json({ ok: true, smsError: result.error });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
