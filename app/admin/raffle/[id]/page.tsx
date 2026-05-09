import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditRaffleForm from "@/components/EditRaffleForm";
import ReferralConfigPanel from "@/components/ReferralConfigPanel";
import DealerSmsConfigPanel from "@/components/DealerSmsConfigPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRafflePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  const raffle = await prisma.raffle.findUnique({ where: { id } });
  if (!raffle) redirect("/admin");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-8" style={{ color: "#3C3B6E" }}>
        ✏️ Edit Raffle
      </h1>
      <EditRaffleForm raffle={raffle} />
      <ReferralConfigPanel raffleId={raffle.id} />
      <DealerSmsConfigPanel raffleId={raffle.id} />
    </div>
  );
}
