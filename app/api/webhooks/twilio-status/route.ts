import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Twilio posts delivery status updates here
export async function POST(req: NextRequest) {
  const text = await req.text();
  const params = new URLSearchParams(text);

  const messageSid = params.get("MessageSid");
  const status = params.get("MessageStatus") ?? "unknown";
  const priceRaw = params.get("Price");
  const cost = priceRaw ? Math.abs(parseFloat(priceRaw)) : null;

  if (!messageSid) return NextResponse.json({ ok: true });

  await prisma.smsLog.updateMany({
    where: { twilioMessageSid: messageSid },
    data: { status, ...(cost !== null ? { cost } : {}) },
  });

  return NextResponse.json({ ok: true });
}
