import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TicketBuySection from "@/components/TicketBuySection";

async function getRaffle() {
  return await prisma.raffle.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

export default async function RafflePage() {
  const raffle = await getRaffle();

  if (!raffle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔜</div>
        <h1 className="text-3xl font-black mb-4" style={{ color: "#3C3B6E" }}>
          Next Raffle Coming Soon
        </h1>
        <p className="text-gray-600 mb-8">
          Our next car raffle is being set up. Sign up to get notified the moment tickets go on sale.
        </p>
        <Link href="/register" className="btn-primary">Create Account & Get Notified</Link>
      </div>
    );
  }

  let photos: string[] = [];
  try { photos = JSON.parse(raffle.photos); } catch {}

  const ticketsLeft = raffle.totalTickets - raffle.soldTickets;
  const pctSold = Math.round((raffle.soldTickets / raffle.totalTickets) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-widest">
          ● Live Raffle
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#3C3B6E" }}>
          {raffle.carYear} {raffle.carMake} {raffle.carModel}
        </h1>
        <p className="text-gray-600 text-lg">{raffle.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Photos */}
        <div>
          <div
            className="rounded-2xl overflow-hidden bg-gray-100 mb-4 flex items-center justify-center"
            style={{ minHeight: "350px" }}
          >
            {photos[0] ? (
              <img src={photos[0]} alt={raffle.title} className="w-full object-cover max-h-96" />
            ) : (
              <div className="text-center text-gray-400 p-12">
                <div className="text-8xl mb-4">🚗</div>
                <p className="font-bold text-xl">{raffle.carYear} {raffle.carMake} {raffle.carModel}</p>
                <p className="text-gray-500">{raffle.carColor}</p>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(1, 5).map((p, i) => (
                <img key={i} src={p} alt="" className="rounded-lg object-cover aspect-square w-full" />
              ))}
            </div>
          )}

          {/* Car Details */}
          <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
            <h3 className="font-black text-lg mb-4" style={{ color: "#3C3B6E" }}>Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Year", raffle.carYear],
                ["Make", raffle.carMake],
                ["Model", raffle.carModel],
                ["Color", raffle.carColor],
                ["Retail Value", `$${raffle.carMsrp.toLocaleString()}`],
                ["Dealer", raffle.dealerName || "Partnered Dealership"],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="text-gray-500 text-xs font-semibold uppercase">{label}</div>
                  <div className="font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
            {raffle.dealerCity && (
              <p className="mt-3 text-xs text-gray-400">
                📍 {raffle.dealerCity}, {raffle.dealerState}
              </p>
            )}
          </div>
        </div>

        {/* Right: Purchase */}
        <div>
          {/* Progress */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span style={{ color: "#3C3B6E" }}>{raffle.soldTickets.toLocaleString()} tickets sold</span>
              <span className="text-gray-500">{ticketsLeft.toLocaleString()} remaining</span>
            </div>
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all"
                style={{ width: `${pctSold}%`, background: "#B22234" }}
              />
            </div>
            <div className="mt-2 text-xs text-center text-gray-500">{pctSold}% sold — hurry before it&apos;s gone!</div>
          </div>

          {/* Odds & price */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black" style={{ color: "#3C3B6E" }}>$10</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">Per Ticket</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-red-700">1:{raffle.totalTickets.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">Odds Per Ticket</div>
            </div>
          </div>

          {raffle.taxCovered && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
              <strong>✅ Taxes & Fees Covered!</strong> American Raffle pays all applicable taxes
              so the winner receives the full value of the prize — zero surprise costs.
            </div>
          )}

          {/* Buy section */}
          <TicketBuySection raffleId={raffle.id} ticketsLeft={ticketsLeft} ticketPrice={raffle.ticketPrice} />
        </div>
      </div>
    </div>
  );
}
