import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STOP_WORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const START_WORDS = ["START", "UNSTOP", "YES"];

// Twilio posts inbound SMS here — handles STOP/UNSTOP for TCPA compliance
export async function POST(req: NextRequest) {
  const text = await req.text();
  const params = new URLSearchParams(text);

  const from = params.get("From") ?? "";
  const body = (params.get("Body") ?? "").trim().toUpperCase();

  if (!from) return new NextResponse("<?xml version='1.0'?><Response/>", { headers: { "Content-Type": "text/xml" } });

  const user = await prisma.user.findFirst({ where: { phone: from } });

  if (STOP_WORDS.includes(body)) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { smsOptIn: false, smsOptOutAt: new Date() },
      });
    }
    // Twilio also handles STOP automatically at the carrier level — this keeps our DB in sync
    return new NextResponse(
      `<?xml version='1.0'?><Response><Message>You have been unsubscribed. Reply START to re-subscribe.</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  if (START_WORDS.includes(body)) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { smsOptIn: true, smsOptInAt: new Date() },
      });
    }
    return new NextResponse(
      `<?xml version='1.0'?><Response><Message>You have re-subscribed to American Raffle SMS alerts. Reply STOP to unsubscribe at any time.</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  if (body === "HELP") {
    return new NextResponse(
      `<?xml version='1.0'?><Response><Message>American Raffle alerts. Reply STOP to unsubscribe. Msg&amp;data rates may apply. Support: support@americanraffle.com</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  return new NextResponse("<?xml version='1.0'?><Response/>", { headers: { "Content-Type": "text/xml" } });
}
