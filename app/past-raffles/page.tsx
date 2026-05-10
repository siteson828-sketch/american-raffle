import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getPastRaffles() {
  return prisma.raffle.findMany({
    where: { status: "completed" },
    include: { drawingLog: true },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function PastRafflesPage() {
  const raffles = await getPastRaffles();

  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)" }}
        className="text-white py-20 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">Past Winners</h1>
        <p className="text-blue-100 text-xl max-w-2xl mx-auto">
          Every American Raffle drawing is publicly verifiable. Browse our complete winner history below.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {raffles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-2xl font-black mb-3" style={{ color: "#3C3B6E" }}>
              No completed raffles yet
            </h2>
            <p className="text-gray-500 mb-8">
              Our first drawing will appear here once it concludes. Enter now for your chance to win!
            </p>
            <Link href="/raffle" className="btn-primary px-8 py-3">
              🎟️ Enter Current Raffle
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {raffles.map((raffle) => {
              let photos: string[] = [];
              try { photos = JSON.parse(raffle.photos); } catch {}
              const log = raffle.drawingLog;

              return (
                <div
                  key={raffle.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="md:flex">
                    {/* Photo */}
                    <div
                      className="md:w-64 shrink-0 bg-gray-100 flex items-center justify-center"
                      style={{ minHeight: "200px" }}
                    >
                      {photos[0] ? (
                        <img
                          src={photos[0]}
                          alt={raffle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400 p-6">
                          <div className="text-5xl mb-2">🚗</div>
                          <p className="text-sm font-semibold">
                            {raffle.carYear} {raffle.carMake}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                            Completed
                          </span>
                          <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>
                            {raffle.title}
                          </h2>
                          <p className="text-gray-500 text-sm mt-1">
                            {raffle.carYear} {raffle.carMake} {raffle.carModel} · {raffle.carColor}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black" style={{ color: "#B22234" }}>
                            ${raffle.carMsrp.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold">Prize Value</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
                        <Stat label="Total Tickets" value={raffle.totalTickets.toLocaleString()} />
                        <Stat label="Tickets Sold" value={raffle.soldTickets.toLocaleString()} />
                        <Stat
                          label="Draw Date"
                          value={log
                            ? new Date(log.drawnAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        />
                        {log && (
                          <Stat
                            label="Winning Ticket"
                            value={`#${log.winnerTicketNum.toString().padStart(6, "0")}`}
                            highlight
                          />
                        )}
                        {raffle.dealerName && (
                          <Stat label="Dealer" value={`${raffle.dealerName}${raffle.dealerCity ? `, ${raffle.dealerCity}` : ""}`} />
                        )}
                        {log?.payoutTriggered && log.payoutAmount && (
                          <Stat
                            label="Dealer Payout"
                            value={`$${log.payoutAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                          />
                        )}
                      </div>

                      {log && (
                        <Link
                          href={`/verify/${raffle.id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          🔍 Verify Drawing &rarr;
                          <span className="font-mono text-xs text-gray-400">
                            {log.verificationHash.slice(0, 16)}…
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-10 text-center text-white"
          style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        >
          <h2 className="text-3xl font-black mb-3">Could You Be Next?</h2>
          <p className="text-blue-100 mb-6">
            Enter the current raffle for just $10 per ticket. Taxes &amp; fees covered.
          </p>
          <Link href="/raffle" className="btn-primary px-10 py-4 text-lg font-black inline-block">
            🎟️ Enter Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
      <div
        className={`font-bold mt-0.5 ${highlight ? "text-red-600" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
