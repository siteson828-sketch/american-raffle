import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId } = await req.json();
  await prisma.raffle.update({
    where: { id: raffleId },
    data: { status: "completed" },
  });

  return NextResponse.json({ success: true });
}
