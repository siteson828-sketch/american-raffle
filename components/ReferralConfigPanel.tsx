"use client";
import { useState, useEffect } from "react";

interface Config {
  enabled: boolean;
  bonusTicketsPerRef: number;
  maxBonusPerUser: number;
  leaderboardEnabled: boolean;
  topReferrerBonus: number;
}

export default function ReferralConfigPanel({ raffleId }: { raffleId: string }) {
  const [cfg, setCfg] = useState<Config>({
    enabled: true,
    bonusTicketsPerRef: 1,
    maxBonusPerUser: 0,
    leaderboardEnabled: true,
    topReferrerBonus: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [tree, setTree] = useState<{ participants: { id: string; name: string | null; email: string; referredBy: { name: string | null; email: string } | null; tickets: { ticketNum: number; isFree: boolean }[] }[]; shares: { userId: string; method: string; createdAt: string; user: { name: string | null; email: string } }[] } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/referral-config?raffleId=${raffleId}`)
      .then((r) => r.json())
      .then((d) => d && setCfg(d))
      .catch(() => {});
  }, [raffleId]);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/referral-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raffleId, ...cfg }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function loadTree() {
    const res = await fetch(`/api/admin/referral-tree?raffleId=${raffleId}`);
    setTree(await res.json());
    setShowTree(true);
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>🔗 Referral Settings</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">Enabled</span>
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
            className="w-5 h-5 accent-red-600"
          />
        </label>
      </div>

      <div className={`space-y-4 ${!cfg.enabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Bonus Tickets Per Referral</label>
            <input
              type="number"
              min={1}
              max={10}
              value={cfg.bonusTicketsPerRef}
              onChange={(e) => setCfg({ ...cfg, bonusTicketsPerRef: parseInt(e.target.value) || 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Tickets awarded to referrer per successful referral</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Max Bonus Per User</label>
            <input
              type="number"
              min={0}
              value={cfg.maxBonusPerUser}
              onChange={(e) => setCfg({ ...cfg, maxBonusPerUser: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">0 = unlimited</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Top Referrer Bonus</label>
            <input
              type="number"
              min={0}
              value={cfg.topReferrerBonus}
              onChange={(e) => setCfg({ ...cfg, topReferrerBonus: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Extra tickets for #1 referrer at draw time (0 = off)</p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.leaderboardEnabled}
            onChange={(e) => setCfg({ ...cfg, leaderboardEnabled: e.target.checked })}
            className="w-4 h-4 accent-red-600"
          />
          <span className="text-sm font-semibold text-gray-700">Show leaderboard on raffle page</span>
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Settings"}
        </button>
        <button
          onClick={loadTree}
          className="btn-secondary text-sm"
        >
          View Referral Tree
        </button>
      </div>

      {/* Referral tree modal */}
      {showTree && tree && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTree(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Referral Tree</h3>
              <button onClick={() => setShowTree(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Participants */}
              <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">Participants ({tree.participants.length})</h4>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {tree.participants.map((p) => (
                    <div key={p.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-bold">{p.name ?? "—"} <span className="text-gray-400 font-normal">{p.email}</span></div>
                      {p.referredBy && (
                        <div className="text-xs text-purple-600 mt-0.5">
                          Referred by: {p.referredBy.name ?? p.referredBy.email}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.tickets.length} ticket{p.tickets.length !== 1 ? "s" : ""} ({p.tickets.filter((t) => t.isFree).length} free)
                      </div>
                    </div>
                  ))}
                  {tree.participants.length === 0 && <p className="text-gray-400 text-sm">No participants yet.</p>}
                </div>
              </div>

              {/* Share events */}
              <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">Share Events ({tree.shares.length})</h4>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {tree.shares.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-bold">{s.user.name ?? s.user.email}</div>
                      <div className="text-xs text-gray-500">
                        {s.method === "sms_twilio" ? "💬 Sent SMS" : s.method === "sms_native" ? "📱 Native SMS" : "📋 Copied link"}
                        &nbsp;— {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {tree.shares.length === 0 && <p className="text-gray-400 text-sm">No shares logged yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
