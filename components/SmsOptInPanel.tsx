"use client";
import { useState } from "react";

interface Props {
  currentPhone?: string | null;
  currentOptIn?: boolean;
}

export default function SmsOptInPanel({ currentPhone, currentOptIn }: Props) {
  const [phone, setPhone] = useState(currentPhone ?? "");
  const [optIn, setOptIn] = useState(currentOptIn ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (optIn && !phone.trim()) {
      setError("Enter your phone number to enable SMS alerts.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/sms/opt-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), optIn }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-black mb-1" style={{ color: "#3C3B6E" }}>📱 SMS Alerts</h2>
      <p className="text-gray-500 text-sm mb-4">
        Get notified about raffle updates, winner announcements, and exclusive offers.
        Message &amp; data rates may apply. Reply STOP to unsubscribe anytime.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Mobile Phone Number</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-red-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            <strong>I consent to receive SMS text messages</strong> from American Raffle at the number above.
            Consent is not a condition of purchase. Msg frequency varies. Msg &amp; data rates may apply.
            Reply <strong>STOP</strong> to cancel, <strong>HELP</strong> for help.
          </span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save SMS Preferences"}
        </button>
      </div>
    </div>
  );
}
