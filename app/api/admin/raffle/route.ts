import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return null;
  }
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const data = await req.json();
  const raffle = await prisma.raffle.create({
    data: {
      title: data.title,
      description: data.description,
      carMake: data.carMake,
      carModel: data.carModel,
      carYear: Number(data.carYear),
      carColor: data.carColor,
      carMsrp: Number(data.carMsrp),
      photos: data.photos || "[]",
      totalTickets: Number(data.totalTickets),
      ticketPrice: Number(data.ticketPrice),
      taxCovered: Boolean(data.taxCovered),
      dealerName: data.dealerName || null,
      dealerCity: data.dealerCity || null,
      dealerState: data.dealerState || null,
      drawDate: data.drawDate ? new Date(data.drawDate) : null,
      status: "active",
    },
  });
  return NextResponse.json({ success: true, raffleId: raffle.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const data = await req.json();
  const { id, ...rest } = data;
  const raffle = await prisma.raffle.update({
    where: { id },
    data: {
      title: rest.title,
      description: rest.description,
      carMake: rest.carMake,
      carModel: rest.carModel,
      carYear: Number(rest.carYear),
      carColor: rest.carColor,
      carMsrp: Number(rest.carMsrp),
      photos: rest.photos || "[]",
      totalTickets: Number(rest.totalTickets),
      ticketPrice: Number(rest.ticketPrice),
      taxCovered: Boolean(rest.taxCovered),
      dealerName: rest.dealerName || null,
      dealerCity: rest.dealerCity || null,
      dealerState: rest.dealerState || null,
    },
  });
  return NextResponse.json({ success: true, raffleId: raffle.id });
}
