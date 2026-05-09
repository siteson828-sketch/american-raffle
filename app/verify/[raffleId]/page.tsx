import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ raffleId: string }>;
}

export default async function VerifyDrawingPage({ params }: Props) {
  const { raffleId } = await params;

  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    include: { drawingLog: true },
  });

  if (!raffle) notFound();

  const log = raffle.drawingLog;

  // Re-derive the hash from stored inputs to confirm it hasn't been tampered with
  let hashValid = false;
  if (log) {
    const recomputed = createHash("sha256")
      .update(
        [raffleId, log.randomSeed, log.winnerTicketNum, log.totalEntries, log.drawnAt.toISOString()].join("|")
      )
      .digest("hex");
    hashValid = recomputed === log.verificationHash;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔍</div>
          <h1 className="text-3xl font-black" style={{ color: "#3C3B6E" }}>Drawing Verification</h1>
          <p className="text-gray-500 mt-2">
            Independent, publicly verifiable record for every American Raffle drawing.
          </p>
        </div>

        {/* Raffle info */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="font-black text-xl mb-1" style={{ color: "#3C3B6E" }}>{raffle.title}</h2>
          <p className="text-gray-500 text-sm">
            {raffle.carYear} {raffle.carMake} {raffle.carModel} · {raffle.totalTickets.toLocaleString()} total tickets
          </p>
          <div className="mt-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              raffle.status === "completed" ? "bg-blue-100 text-blue-700" :
              raffle.status === "active" ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {raffle.status.toUpperCase()}
            </span>
          </div>
        </div>

        {!log ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p className="font-bold text-yellow-700">No drawing has been conducted for this raffle yet.</p>
            <p className="text-yellow-600 text-sm mt-1">Check back after the draw date.</p>
          </div>
        ) : (
          <>
            {/* Verification status banner */}
            <div className={`rounded-2xl p-5 mb-6 flex items-center gap-4 ${
              hashValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              <div className="text-4xl">{hashValid ? "✅" : "❌"}</div>
              <div>
                <p className={`font-black text-lg ${hashValid ? "text-green-700" : "text-red-700"}`}>
                  {hashValid ? "Hash Verified — Drawing is Authentic" : "Hash Mismatch — Record May Have Been Tampered"}
                </p>
                <p className={`text-sm ${hashValid ? "text-green-600" : "text-red-600"}`}>
                  {hashValid
                    ? "The stored hash matches a re-computation from the raw inputs. This drawing has not been altered."
                    : "The stored hash does not match the inputs. Contact support immediately."}
                </p>
              </div>
            </div>

            {/* Drawing details */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4">
              <h3 className="font-black text-lg" style={{ color: "#3C3B6E" }}>Drawing Details</h3>

              <Row label="Drawn At" value={new Date(log.drawnAt).toLocaleString("en-US", { timeZoneName: "short" })} />
              <Row label="Selection Method" value={log.method === "crypto_random" ? "crypto.randomBytes(32) — Node.js CSPRNG" : log.method} />
              <Row label="Total Entries" value={log.totalEntries.toLocaleString()} />
              <Row label="Winning Ticket #" value={`#${log.winnerTicketNum.toString().padStart(6, "0")}`} highlight />

              {/* Payout */}
              {log.payoutTriggered && (
                <Row
                  label="Dealer Payout"
                  value={`$${log.payoutAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })} via Stripe (${log.stripeTransferId})`}
                />
              )}
            </div>

            {/* Cryptographic proof */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h3 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Cryptographic Proof</h3>
              <p className="text-sm text-gray-500 mb-4">
                Anyone can independently verify this drawing by re-computing the SHA-256 hash from the inputs below and comparing it to the published hash.
              </p>

              <div className="space-y-3">
                <HashInput label="Raffle ID" value={raffleId} />
                <HashInput label="Random Seed (hex)" value={log.randomSeed} mono />
                <HashInput label="Winning Ticket #" value={String(log.winnerTicketNum)} />
                <HashInput label="Total Entries" value={String(log.totalEntries)} />
                <HashInput label="Drawn At (ISO)" value={log.drawnAt.toISOString()} />
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Hash formula</p>
                <code className="text-xs text-gray-700 break-all">
                  SHA-256(raffleId | seed | winnerTicketNum | totalEntries | drawnAt)
                </code>
              </div>

              <div className="mt-4 bg-gray-900 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Published Verification Hash</p>
                <code className="text-green-400 text-xs break-all font-mono">{log.verificationHash}</code>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Raffle ID: <code className="font-mono">{raffleId}</code>
            </div>
          </>
        )}

        <div className="text-center mt-8">
          <Link href="/raffle" className="text-sm text-blue-600 hover:underline">← Back to Current Raffle</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right ${highlight ? "text-red-600 text-base" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

function HashInput({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xs text-gray-700 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
