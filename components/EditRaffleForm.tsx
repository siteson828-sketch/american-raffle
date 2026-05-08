"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  status: string;
}

export default function EditRaffleForm({ raffle }: { raffle: Raffle }) {
  const router = useRouter();
  let photoArr: string[] = [];
  try { photoArr = JSON.parse(raffle.photos); } catch {}

  const [form, setForm] = useState({ ...raffle, photosText: photoArr.join("\n") });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const photos = JSON.stringify(
      form.photosText.split("\n").map((u) => u.trim()).filter(Boolean)
    );
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
        <label className="block text-sm font-bold text-gray-700 mb-1">Photo URLs (one per line)</label>
        <textarea
          rows={4}
          value={form.photosText}
          onChange={(e) => update("photosText", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-blue-400"
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
