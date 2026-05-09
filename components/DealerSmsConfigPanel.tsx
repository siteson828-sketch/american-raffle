"use client";
import { useState, useEffect } from "react";

interface Status { configured: boolean; accountSidMasked: string | null; fromNumber: string | null }

export default function DealerSmsConfigPanel({ raffleId }: { raffleId: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [form, setForm] = useState({ accountSid: "", authToken: "", fromNumber: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/dealer-sms-config?raffleId=${raffleId}`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, [raffleId]);

  async function save() {
    if (!form.fromNumber.trim()) { setError("From number is required"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/dealer-sms-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raffleId, ...form }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save."); return; }
    setSaved(true);
    setShowForm(false);
    // Refresh status
    fetch(`/api/admin/dealer-sms-config?raffleId=${raffleId}`).then((r) => r.json()).then(setStatus).catch(() => {});
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-black" style={{ color: "#3C3B6E" }}>🔐 Dealer Twilio Credentials</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Optional: use dealer&apos;s own Twilio sub-account for SMS from their number. Stored AES-256-GCM encrypted.
          </p>
        </div>
        {status?.configured && (
          <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Configured</span>
        )}
      </div>

      {status?.configured && !showForm && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm mb-3 space-y-1">
          <div><span className="text-gray-500">Account SID: </span><span className="font-mono">{status.accountSidMasked}</span></div>
          <div><span className="text-gray-500">Auth Token: </span><span className="font-mono">••••••••••••••••</span></div>
          <div><span className="text-gray-500">From Number: </span><span className="font-mono">{status.fromNumber}</span></div>
        </div>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary text-sm">
          {status?.configured ? "Update Credentials" : "Add Dealer Credentials"}
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Twilio Account SID</label>
            <input
              type="text"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={form.accountSid}
              onChange={(e) => setForm({ ...form, accountSid: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              autoComplete="off"
            />
            {status?.configured && <p className="text-xs text-gray-400 mt-0.5">Leave blank to keep existing</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Twilio Auth Token</label>
            <input
              type="password"
              placeholder="Auth token (32 hex chars)"
              value={form.authToken}
              onChange={(e) => setForm({ ...form, authToken: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              autoComplete="new-password"
            />
            {status?.configured && <p className="text-xs text-gray-400 mt-0.5">Leave blank to keep existing</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">From Phone Number (E.164)</label>
            <input
              type="text"
              placeholder="+15550001234"
              value={form.fromNumber}
              onChange={(e) => setForm({ ...form, fromNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Encrypted"}
            </button>
            <button onClick={() => { setShowForm(false); setError(""); }} className="btn-secondary text-sm">Cancel</button>
          </div>
          <p className="text-xs text-gray-400">
            Credentials are encrypted with AES-256-GCM before storage. The plaintext is never logged.
          </p>
        </div>
      )}
    </div>
  );
}
