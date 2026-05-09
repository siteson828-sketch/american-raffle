import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CopyReferralLink from "@/components/CopyReferralLink";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tickets: {
        include: { raffle: true },
        orderBy: { createdAt: "desc" },
      },
      referrals: true,
    },
  });

  if (!user) redirect("/login");

  const activeTickets = user.tickets.filter((t: (typeof user.tickets)[number]) => t.raffle.status === "active");
  const pastTickets = user.tickets.filter((t: (typeof user.tickets)[number]) => t.raffle.status !== "active");
  const freeTickets = user.tickets.filter((t: (typeof user.tickets)[number]) => t.isFree);

  const referralUrl = `${process.env.NEXTAUTH_URL}/register?ref=${user.referralCode}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#3C3B6E" }}>
            Welcome back, {user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <Link href="/raffle" className="btn-primary hidden md:block">
          🎟️ Buy More Tickets
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Tickets", value: user.tickets.length, color: "#3C3B6E" },
          { label: "Active Entries", value: activeTickets.length, color: "#B22234" },
          { label: "Free Tickets", value: freeTickets.length, color: "#16a34a" },
          { label: "Friends Referred", value: user.referrals.length, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-md p-5 text-center">
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-500 text-sm font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div
        className="rounded-2xl p-6 text-white mb-10"
        style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
      >
        <h2 className="text-xl font-black mb-2">🎁 Your Referral Link</h2>
        <p className="text-blue-100 text-sm mb-4">
          Share this link and earn 1 free ticket for every friend who joins and buys a ticket!
        </p>
        <CopyReferralLink referralUrl={referralUrl} />
      </div>

      {/* Active Tickets */}
      <div className="mb-10">
        <h2 className="text-xl font-black mb-4" style={{ color: "#3C3B6E" }}>
          🎟️ Active Raffle Entries ({activeTickets.length})
        </h2>
        {activeTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            <p className="mb-4">You have no active entries yet.</p>
            <Link href="/raffle" className="btn-primary">Buy Tickets Now</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: "#3C3B6E" }} className="text-white">
                <tr>
                  <th className="text-left px-4 py-3">Ticket #</th>
                  <th className="text-left px-4 py-3">Raffle</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {activeTickets.map((ticket: (typeof user.tickets)[number], i: number) => (
                  <tr key={ticket.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-bold" style={{ color: "#B22234" }}>
                      #{ticket.ticketNum.toString().padStart(6, "0")}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.raffle.carYear} {ticket.raffle.carMake} {ticket.raffle.carModel}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.isFree ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          FREE ({ticket.freeReason})
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          Purchased
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Tickets */}
      {pastTickets.length > 0 && (
        <div>
          <h2 className="text-xl font-black mb-4 text-gray-500">Past Entries ({pastTickets.length})</h2>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden opacity-75">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Ticket #</th>
                  <th className="text-left px-4 py-3">Raffle</th>
                  <th className="text-left px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {pastTickets.slice(0, 10).map((ticket: (typeof user.tickets)[number], i: number) => (
                  <tr key={ticket.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-bold text-gray-500">
                      #{ticket.ticketNum.toString().padStart(6, "0")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ticket.raffle.carYear} {ticket.raffle.carMake} {ticket.raffle.carModel}
                    </td>
                    <td className="px-4 py-3">
                      {ticket.raffle.winnerId === ticket.userId ? (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          🏆 WINNER!
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Did not win</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
