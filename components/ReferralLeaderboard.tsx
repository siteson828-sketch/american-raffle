"use client";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  count: number;
}

export default function ReferralLeaderboard({ raffleId }: { raffleId: string }) {
  const [data, setData] = useState<{ leaderboard: LeaderboardEntry[]; enabled: boolean; topReferrerBonus: number } | null>(null);

  useEffect(() => {
    fetch(`/api/referral/leaderboard?raffleId=${raffleId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [raffleId]);

  if (!data || !data.enabled || data.leaderboard.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <h3 className="font-black text-lg mb-1" style={{ color: "#3C3B6E" }}>
        🏆 Top Referrers
      </h3>
      {data.topReferrerBonus > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Top referrer earns +{data.topReferrerBonus} bonus ticket{data.topReferrerBonus > 1 ? "s" : ""}!
        </p>
      )}
      <div className="space-y-2">
        {data.leaderboard.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{medals[entry.rank - 1] ?? `#${entry.rank}`}</span>
              <span className="font-semibold text-gray-800">{entry.name}</span>
            </div>
            <span
              className="text-sm font-black px-3 py-1 rounded-full text-white"
              style={{ background: entry.rank === 1 ? "#B22234" : "#3C3B6E" }}
            >
              {entry.count} referral{entry.count !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">Share your link to climb the leaderboard!</p>
    </div>
  );
}
