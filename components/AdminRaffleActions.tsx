"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  raffleId: string;
  status: string;
}

export default function AdminRaffleActions({ raffleId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  async function pickWinner() {
    if (!confirm("Pick a random winner? This action cannot be undone.")) return;
    setLoading("winner");
    const res = await fetch(`/api/admin/pick-winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raffleId }),
    });
    const data = await res.json();
    if (data.winner) {
      setPicked(`Winner: ${data.winner.name} (Ticket #${data.winningTicket})`);
    }
    setLoading("");
    router.refresh();
  }

  async function closeRaffle() {
    if (!confirm("Close this raffle? It will no longer accept new entries.")) return;
    setLoading("close");
    await fetch(`/api/admin/close-raffle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raffleId }),
    });
    setLoading("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {picked && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-center font-bold text-yellow-800">
          🏆 {picked}
        </div>
      )}
      <button
        onClick={pickWinner}
        disabled={loading === "winner" || status !== "active"}
        className="w-full py-3 rounded-lg text-white font-bold transition-opacity disabled:opacity-50"
        style={{ background: "#B22234" }}
      >
        {loading === "winner" ? "Picking..." : "🎲 Pick Random Winner"}
      </button>
      <button
        onClick={closeRaffle}
        disabled={loading === "close" || status !== "active"}
        className="w-full py-3 rounded-lg font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading === "close" ? "Closing..." : "Close Raffle"}
      </button>
    </div>
  );
}
