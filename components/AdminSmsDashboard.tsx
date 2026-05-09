"use client";
import { useEffect, useState } from "react";

interface SmsStats {
  sentToday: number;
  sentMonth: number;
  deliveryRate: string;
  failureRate: string;
  optOutRate: string;
  optInCount: number;
  optOutCount: number;
  totalCostAllTime: string;
  monthCost: string;
  recentLogs: { status: string; type: string; cost: number | null; sentAt: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  sent: "bg-blue-100 text-blue-700",
  queued: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  undelivered: "bg-red-100 text-red-700",
};

export default function AdminSmsDashboard() {
  const [stats, setStats] = useState<SmsStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/sms-stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="bg-white rounded-2xl shadow-md p-6 mt-10 animate-pulse h-40" />;

  const statCards = [
    { label: "Sent Today", value: stats.sentToday, color: "#3C3B6E" },
    { label: "Sent This Month", value: stats.sentMonth, color: "#B22234" },
    { label: "Delivery Rate", value: `${stats.deliveryRate}%`, color: "#16a34a" },
    { label: "Opt-out Rate", value: `${stats.optOutRate}%`, color: "#7c3aed" },
    { label: "Month Cost (USD)", value: `$${stats.monthCost}`, color: "#B22234" },
    { label: "All-Time Cost", value: `$${stats.totalCostAllTime}`, color: "#3C3B6E" },
    { label: "Opted-In Users", value: stats.optInCount, color: "#16a34a" },
    { label: "Opted-Out Users", value: stats.optOutCount, color: "#6b7280" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-10">
      <h2 className="text-xl font-black mb-4" style={{ color: "#3C3B6E" }}>📱 SMS Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-sm text-gray-500 uppercase mb-2">Recent Messages</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Cost</th>
              <th className="text-left px-3 py-2">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentLogs.map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 text-gray-700">{log.type.replace(/_/g, " ")}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[log.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">
                  {log.cost !== null ? `$${log.cost.toFixed(4)}` : "—"}
                </td>
                <td className="px-3 py-2 text-gray-400">
                  {new Date(log.sentAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {stats.recentLogs.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">No SMS sent yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Recipient phone numbers are never stored — only SHA-256 hashes. Cost data populated after Twilio delivery callback.
      </p>
    </div>
  );
}
