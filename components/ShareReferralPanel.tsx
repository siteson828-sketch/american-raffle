"use client";
import { useState } from "react";

interface Props {
  referralUrl: string;
  raffleName?: string;
  raffleId?: string;
  compact?: boolean;
}

export default function ShareReferralPanel({ referralUrl, raffleName, raffleId, compact }: Props) {
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState("");
  const [sendingTwilio, setSendingTwilio] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const prewrittenMsg = raffleName
    ? `I just entered to win a ${raffleName}! Enter here and we BOTH get a free ticket: ${referralUrl}`
    : `Enter to win a free car and we BOTH get a bonus ticket: ${referralUrl}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    if (raffleId) {
      fetch("/api/referral/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId, method: "copy" }),
      }).catch(() => {});
    }
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNativeSms() {
    const smsUrl = `sms:?&body=${encodeURIComponent(prewrittenMsg)}`;
    window.open(smsUrl, "_blank");
    if (raffleId) {
      fetch("/api/referral/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId, method: "sms_native" }),
      }).catch(() => {});
    }
  }

  async function handleTwilioSms() {
    if (!phone.trim()) return;
    setSendingTwilio(true);
    setSmsError("");
    const res = await fetch("/api/referral/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raffleId, method: "sms_twilio", phone: phone.trim() }),
    });
    const data = await res.json();
    setSendingTwilio(false);
    if (data.smsError) {
      setSmsError("SMS failed — try copying the link instead.");
    } else {
      setSmsSent(true);
      setPhone("");
      setShowPhoneInput(false);
    }
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      {/* Link copy row */}
      <div className="flex gap-2">
        <input
          readOnly
          value={referralUrl}
          className={`flex-1 text-sm rounded-lg px-3 py-2 ${compact ? "bg-white/20 border border-white/30 text-white" : "border border-gray-300 bg-gray-50 text-gray-800"}`}
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors whitespace-nowrap"
          style={{ background: copied ? "#16a34a" : "#B22234" }}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleNativeSms}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: "#16a34a" }}
          title="Opens SMS app on mobile, or use the desktop option below"
        >
          📱 Share via SMS
        </button>

        {!showPhoneInput && (
          <button
            onClick={() => setShowPhoneInput(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border"
            style={{ borderColor: "#B22234", color: "#B22234", background: "transparent" }}
          >
            💻 Send to a Phone #
          </button>
        )}
      </div>

      {/* Twilio desktop SMS */}
      {showPhoneInput && (
        <div className="flex gap-2 items-center">
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={handleTwilioSms}
            disabled={sendingTwilio || !phone.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap"
            style={{ background: smsSent ? "#16a34a" : "#3C3B6E" }}
          >
            {sendingTwilio ? "Sending…" : smsSent ? "✓ Sent!" : "Send SMS"}
          </button>
          <button onClick={() => setShowPhoneInput(false)} className="text-gray-400 text-lg px-1">×</button>
        </div>
      )}

      {smsError && <p className="text-red-500 text-xs">{smsError}</p>}
      {smsSent && <p className="text-green-600 text-xs font-semibold">SMS sent successfully!</p>}

      <p className={`text-xs mt-1 ${compact ? "text-blue-200" : "text-gray-500"}`}>
        Pre-written message: &ldquo;{prewrittenMsg.length > 80 ? prewrittenMsg.slice(0, 80) + "…" : prewrittenMsg}&rdquo;
      </p>
    </div>
  );
}
