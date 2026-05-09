import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId, accountSid, authToken, fromNumber } = await req.json();
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const data: Record<string, string | null> = { fromNumber: fromNumber ?? null };
  if (accountSid) data.accountSidEnc = encrypt(accountSid);
  if (authToken) data.authTokenEnc = encrypt(authToken);

  await prisma.dealerSmsConfig.upsert({
    where: { raffleId },
    create: { raffleId, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const raffleId = req.nextUrl.searchParams.get("raffleId");
  if (!raffleId) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

  const cfg = await prisma.dealerSmsConfig.findUnique({ where: { raffleId } });
  if (!cfg) return NextResponse.json({ configured: false });

  // Return masked values — never expose decrypted secrets
  let sidMasked: string | null = null;
  if (cfg.accountSidEnc) {
    try {
      const plain = decrypt(cfg.accountSidEnc);
      sidMasked = plain.slice(0, 6) + "••••••••" + plain.slice(-4);
    } catch { sidMasked = "••••••••"; }
  }

  return NextResponse.json({
    configured: !!(cfg.accountSidEnc && cfg.authTokenEnc),
    accountSidMasked: sidMasked,
    fromNumber: cfg.fromNumber,
  });
}
