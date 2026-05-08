import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { raffleId } = await req.json();
  const tickets = await prisma.ticket.findMany({
    where: { raffleId },
    include: { user: true },
  });

  if (tickets.length === 0) {
    return NextResponse.json({ error: "No tickets in this raffle." }, { status: 400 });
  }

  const winningTicket = tickets[Math.floor(Math.random() * tickets.length)];

  await prisma.raffle.update({
    where: { id: raffleId },
    data: { winnerId: winningTicket.userId, status: "completed" },
  });

  return NextResponse.json({
    success: true,
    winner: { name: winningTicket.user.name, email: winningTicket.user.email },
    winningTicket: winningTicket.ticketNum,
  });
}
