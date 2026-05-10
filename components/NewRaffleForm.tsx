"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PhotoUploader from "./PhotoUploader";

export default function NewRafflePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    carMake: "",
    carModel: "",
    carYear: new Date().getFullYear(),
    carColor: "",
    carMsrp: 40000,
    photos: [] as string[],
    totalTickets: 10000,
    ticketPrice: 10,
    taxCovered: true,
    dealerName: "",
    dealerCity: "",
    dealerState: "",
    drawDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const photos = JSON.stringify(form.photos);
    const res = await fetch("/api/admin/raffle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photos }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create raffle.");
      setSaving(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-8" style={{ color: "#3C3B6E" }}>
        ➕ Create New Raffle
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
        {/* Car Info */}
        <div>
          <h2 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Car Make", field: "carMake", placeholder: "Chevrolet" },
              { label: "Car Model", field: "carModel", placeholder: "Corvette" },
              { label: "Car Year", field: "carYear", type: "number", placeholder: "2025" },
              { label: "Car Color", field: "carColor", placeholder: "Torch Red" },
              { label: "MSRP ($)", field: "carMsrp", type: "number", placeholder: "65000" },
            ].map(({ label, field, type = "text", placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={(form as Record<string, unknown>)[field] as string}
                  onChange={(e) => update(field, type === "number" ? Number(e.target.value) : e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Raffle Details */}
        <div>
          <h2 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Raffle Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Raffle Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Win a 2025 Chevy Corvette!"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Enter a compelling description of this raffle..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Tickets</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={form.totalTickets}
                  onChange={(e) => update("totalTickets", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ticket Price ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.ticketPrice}
                  onChange={(e) => update("ticketPrice", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Draw Date (optional)</label>
              <input
                type="datetime-local"
                value={form.drawDate}
                onChange={(e) => update("drawDate", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
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
                Taxes & fees covered by American Raffle
              </label>
            </div>
          </div>
        </div>

        {/* Dealer Info */}
        <div>
          <h2 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Dealer Partnership (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dealer Name</label>
              <input
                type="text"
                value={form.dealerName}
                onChange={(e) => update("dealerName", e.target.value)}
                placeholder="Smith Chevrolet"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={form.dealerCity}
                onChange={(e) => update("dealerCity", e.target.value)}
                placeholder="Dallas"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={form.dealerState}
                onChange={(e) => update("dealerState", e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div>
          <h2 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Vehicle Photos</h2>
          <PhotoUploader
            urls={form.photos}
            onChange={(urls) => update("photos", urls)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl text-white font-black text-lg disabled:opacity-60"
          style={{ background: "#B22234" }}
        >
          {saving ? "Creating Raffle..." : "🚀 Launch Raffle"}
        </button>
      </form>
    </div>
  );
}
