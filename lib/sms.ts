import { createHash } from "crypto";
import { prisma } from "./prisma";
import { decrypt } from "./encryption";

const BASE_URL = process.env.NEXTAUTH_URL ?? "";

function platformClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio");
  return twilio(sid, token);
}

async function dealerClient(raffleId: string): Promise<{ client: ReturnType<typeof platformClient>; from: string } | null> {
  const cfg = await prisma.dealerSmsConfig.findUnique({ where: { raffleId } });
  if (!cfg?.accountSidEnc || !cfg?.authTokenEnc || !cfg?.fromNumber) return null;
  try {
    const sid = decrypt(cfg.accountSidEnc);
    const token = decrypt(cfg.authTokenEnc);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require("twilio");
    return { client: twilio(sid, token), from: cfg.fromNumber };
  } catch {
    return null;
  }
}

export interface SendSmsOpts {
  to: string;
  userId?: string;
  body: string;
  type: string;
  raffleId?: string;
  useDealerCredentials?: boolean;
}

export async function sendSms(opts: SendSmsOpts): Promise<{ ok: boolean; error?: string }> {
  const { to, userId, body, type, raffleId, useDealerCredentials } = opts;

  // TCPA: verify opt-in
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { smsOptIn: true, smsOptInAt: true, smsOptOutAt: true },
    });
    if (!user?.smsOptIn) return { ok: false, error: "User has not opted in to SMS" };
    if (user.smsOptOutAt && (!user.smsOptInAt || user.smsOptOutAt > user.smsOptInAt)) {
      return { ok: false, error: "User has opted out" };
    }
  }

  // TCPA: always append opt-out instruction
  const fullBody = `${body}\n\nReply STOP to unsubscribe.`;
  const recipientHash = createHash("sha256").update(to.replace(/\s/g, "")).digest("hex");

  let messageSid: string | null = null;
  let status = "queued";
  let errorCode: string | null = null;
  let cost: number | null = null;

  const client = useDealerCredentials && raffleId
    ? await dealerClient(raffleId)
    : null;

  const activeClient = client?.client ?? platformClient();
  const from = client?.from ?? process.env.TWILIO_PHONE_NUMBER;

  if (!activeClient || !from) {
    // Dev fallback — no credentials
    console.log(`[SMS] To: ${to} | ${fullBody}`);
    status = "sent";
  } else {
    try {
      const msg = await activeClient.messages.create({
        body: fullBody,
        from,
        to,
        statusCallback: `${BASE_URL}/api/webhooks/twilio-status`,
      });
      messageSid = msg.sid;
      status = msg.status ?? "sent";
    } catch (err: unknown) {
      const twilioErr = err as { code?: number; message?: string };
      status = "failed";
      errorCode = twilioErr?.code?.toString() ?? "unknown";
      await prisma.smsLog.create({
        data: { recipientHash, userId: userId ?? null, type, status, errorCode, raffleId: raffleId ?? null },
      });
      return { ok: false, error: twilioErr?.message ?? "SMS failed" };
    }
  }

  await prisma.smsLog.create({
    data: { recipientHash, userId: userId ?? null, type, status, twilioMessageSid: messageSid, cost, raffleId: raffleId ?? null },
  });

  return { ok: true };
}

export function hashPhone(phone: string): string {
  return createHash("sha256").update(phone.replace(/\s/g, "")).digest("hex");
}
