"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  raffleId: string;
  ticketsLeft: number;
  ticketPrice: number;
}

export default function TicketBuySection({ raffleId, ticketsLeft, ticketPrice }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxQty = Math.min(ticketsLeft, 100);
  const total = (qty * ticketPrice).toFixed(2);

  async function handleBuy() {
    if (!session) {
      router.push("/login?redirect=/raffle");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId, quantity: qty }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const presets = [1, 5, 10, 25];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2" style={{ borderColor: "#B22234" }}>
      <h3 className="font-black text-xl mb-4" style={{ color: "#3C3B6E" }}>
        🎟️ Buy Your Tickets
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          How many tickets?
        </label>
        <div className="flex gap-2 mb-3 flex-wrap">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setQty(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
                qty === p
                  ? "text-white border-red-600"
                  : "border-gray-200 text-gray-700 hover:border-red-300"
              }`}
              style={qty === p ? { background: "#B22234", borderColor: "#B22234" } : {}}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-red-400 transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 text-center text-xl font-black border-2 border-gray-300 rounded-lg py-2 focus:border-red-400 outline-none"
          />
          <button
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-red-400 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{qty} ticket{qty > 1 ? "s" : ""} × ${ticketPrice}</span>
          <span>${total}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Taxes & fees</span>
          <span className="text-green-600 font-bold">$0.00 (covered!)</span>
        </div>
        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-black text-lg">
          <span>Total</span>
          <span style={{ color: "#B22234" }}>${total}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={loading || ticketsLeft === 0}
        className="w-full py-4 rounded-xl text-white font-black text-lg transition-opacity disabled:opacity-60"
        style={{ background: "#B22234" }}
      >
        {loading ? "Processing..." : ticketsLeft === 0 ? "Sold Out" : `🎟️ Buy ${qty} Ticket${qty > 1 ? "s" : ""} — $${total}`}
      </button>

      {!session && (
        <p className="text-center text-sm text-gray-500 mt-3">
          You&apos;ll be asked to log in or create a free account.
        </p>
      )}
      <p className="text-center text-xs text-gray-400 mt-2">
        Secure checkout powered by Stripe. 🔒
      </p>
    </div>
  );
}
