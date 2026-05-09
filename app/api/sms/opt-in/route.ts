import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone, optIn } = await req.json();

  if (optIn && !phone?.trim()) {
    return NextResponse.json({ error: "Phone number required to opt in" }, { status: 400 });
  }

  const normalizedPhone = phone?.trim() ?? undefined;

  // Basic E.164-ish validation
  if (optIn && normalizedPhone && !/^\+?[1-9]\d{7,14}$/.test(normalizedPhone.replace(/[\s\-().]/g, ""))) {
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
      smsOptIn: optIn,
      ...(optIn ? { smsOptInAt: new Date() } : { smsOptOutAt: new Date() }),
    },
  });

  return NextResponse.json({ ok: true });
}
