import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Desktop SMS via Twilio — only when phone provided and env vars present
  if (method === "sms_twilio" && phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
    if (user && raffle) {
      const referralUrl = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;
      const carName = `${raffle.carYear} ${raffle.carMake} ${raffle.carModel}`;
      const message = `I just entered to win a ${carName}! Enter here and we BOTH get a free ticket: ${referralUrl}`;
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
      } catch (err) {
        console.error("Twilio SMS failed:", err);
        return NextResponse.json({ ok: true, smsError: "SMS failed to send" });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
