"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PhotoUploader from "./PhotoUploader";

interface Raffle {
  id: string;
  title: string;
  description: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carColor: string;
  carMsrp: number;
  photos: string;
  totalTickets: number;
  ticketPrice: number;
  taxCovered: boolean;
  dealerName: string | null;
  dealerCity: string | null;
  dealerState: string | null;
  dealerStripeAccountId: string | null;
  status: string;
}

export default function EditRaffleForm({ raffle }: { raffle: Raffle }) {
  const router = useRouter();
  let photoArr: string[] = [];
  try { photoArr = JSON.parse(raffle.photos); } catch {}

  const [form, setForm] = useState({ ...raffle, photosUrls: photoArr });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; detailsSubmitted: boolean } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/stripe-connect?raffleId=${raffle.id}`)
      .then((r) => r.json())
      .then((d) => setConnectStatus(d))
      .catch(() => {});
  }, [raffle.id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const photos = JSON.stringify(form.photosUrls);
    const res = await fetch(`/api/admin/raffle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photos, id: raffle.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save.");
    } else {
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
    router.refresh();
  }

  async function handleStripeConnect() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/admin/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId: raffle.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setConnectLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Title", field: "title" },
          { label: "Car Make", field: "carMake" },
          { label: "Car Model", field: "carModel" },
          { label: "Car Year", field: "carYear", type: "number" },
          { label: "Car Color", field: "carColor" },
          { label: "MSRP ($)", field: "carMsrp", type: "number" },
          { label: "Total Tickets", field: "totalTickets", type: "number" },
          { label: "Ticket Price ($)", field: "ticketPrice", type: "number" },
          { label: "Dealer Name", field: "dealerName" },
          { label: "Dealer City", field: "dealerCity" },
          { label: "Dealer State", field: "dealerState" },
        ].map(({ label, field, type = "text" }) => (
          <div key={field}>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={(form as Record<string, unknown>)[field] as string ?? ""}
              onChange={(e) => update(field, type === "number" ? Number(e.target.value) : e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Photos</label>
        <PhotoUploader
          urls={form.photosUrls}
          onChange={(urls) => update("photosUrls", urls)}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="taxCovered"
          checked={form.taxCovered}
          onChange={(e) => update("taxCovered", e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="taxCovered" className="text-sm font-bold text-gray-700">
          Taxes & fees covered
        </label>
      </div>

      {/* Stripe Connect */}
      <div className="border-t pt-6">
        <h3 className="font-black text-base mb-3" style={{ color: "#3C3B6E" }}>💳 Dealer Stripe Connect Payout</h3>
        <p className="text-sm text-gray-500 mb-4">
          Connect a Stripe account for the dealer so they receive 90% of net proceeds automatically when the winner is drawn.
        </p>
        {connectStatus?.connected ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-700 text-sm">Stripe account connected & active</p>
              <p className="text-green-600 text-xs font-mono">{raffle.dealerStripeAccountId}</p>
            </div>
          </div>
        ) : connectStatus?.detailsSubmitted ? (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-yellow-700 text-sm">Onboarding submitted — awaiting Stripe verification</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStripeConnect}
            disabled={connectLoading}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
            style={{ background: "#635bff" }}
          >
            {connectLoading ? "Redirecting…" : "🔗 Connect Dealer Stripe Account"}
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 rounded-xl text-white font-black disabled:opacity-60"
          style={{ background: "#B22234" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
