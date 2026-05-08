"use client";
import { useState } from "react";

export default function CopyReferralLink({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={referralUrl}
        className="flex-1 text-sm bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-blue-200"
      />
      <button
        onClick={copy}
        className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        style={{ background: copied ? "#16a34a" : "#B22234" }}
      >
        {copied ? "✓ Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
