"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function FreeTicketsPage() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const referralLink = session
    ? `${typeof window !== "undefined" ? window.location.origin : "https://americanraffle.com"}/register?ref=${(session.user as { referralCode?: string })?.referralCode || ""}`
    : null;

  function copyLink() {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        className="text-white py-20 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">Get FREE Tickets! 🎁</h1>
        <p className="text-blue-100 text-xl max-w-2xl mx-auto">
          You don&apos;t have to spend a dime to win. Earn free raffle entries two ways.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Referral */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#3C3B6E" }}>
              Refer Friends
            </h2>
            <div
              className="inline-block text-white text-sm font-bold px-3 py-1 rounded-full mb-4"
              style={{ background: "#B22234" }}
            >
              1 Free Ticket Per Referral
            </div>
            <p className="text-gray-600 mb-4">
              Share your unique referral link. For every friend who creates an account and
              purchases at least one ticket, you both earn <strong>1 free ticket</strong> in the current raffle!
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Share via text, email, or social media</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited referrals — earn as many as you want</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Your friend gets a free ticket too!</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Tickets automatically added to your account</li>
            </ul>

            {session ? (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Your Referral Link:</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={referralLink || ""}
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors"
                    style={{ background: copied ? "#16a34a" : "#B22234" }}
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/register" className="btn-primary block text-center">
                Create Account to Get Your Link
              </Link>
            )}
          </div>

          {/* Merch */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-5xl mb-4">🛍️</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#3C3B6E" }}>
              Buy Merch
            </h2>
            <div
              className="inline-block text-white text-sm font-bold px-3 py-1 rounded-full mb-4"
              style={{ background: "#B22234" }}
            >
              1 Free Ticket Per $25 Spent
            </div>
            <p className="text-gray-600 mb-4">
              Purchase American Raffle merchandise from our store and earn free raffle entries.
              For every <strong>$25 spent</strong> on merch, you earn <strong>1 free ticket</strong>!
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Shirts, hats, flags & more</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All American-made quality</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Tickets credited within 24 hours</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Support the mission twice over</li>
            </ul>
            <Link href="/merch" className="btn-primary block text-center">
              Shop the Merch Store →
            </Link>
          </div>
        </div>

        {/* AMOE Section */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 mb-16">
          <h2 className="text-2xl font-black mb-4" style={{ color: "#3C3B6E" }}>
            📬 Free Entry — No Purchase Necessary
          </h2>
          <p className="text-gray-700 mb-4">
            As required by law, American Raffle offers a free alternative method of entry (AMOE).
            You may enter without making any purchase by mailing a handwritten request to:
          </p>
          <div className="bg-white rounded-xl p-4 font-mono text-sm text-gray-700 mb-4">
            American Raffle Foundation<br />
            AMOE Department<br />
            [Street Address]<br />
            [City, State ZIP]
          </div>
          <p className="text-sm text-gray-600">
            Include your full name, email address, phone number, and the raffle you wish to enter.
            One free entry per household per raffle. Allow 7–10 business days for processing.
          </p>
        </div>

        {/* Leaderboard tease */}
        <div
          className="rounded-2xl p-8 text-white text-center"
          style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        >
          <h2 className="text-2xl font-black mb-3">💪 Top Referrers</h2>
          <p className="text-blue-100 mb-6">
            Our most active referrers this month earn bonus entries and exclusive prizes!
          </p>
          {session ? (
            <Link href="/account" className="btn-primary">View My Referral Stats →</Link>
          ) : (
            <Link href="/register" className="btn-primary">Join & Start Referring →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
