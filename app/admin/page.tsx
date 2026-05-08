import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminRaffleActions from "@/components/AdminRaffleActions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if ((session.user as { role?: string }).role !== "admin") redirect("/");

  const [raffles, users, orders, recentOrders] = await Promise.all([
    prisma.raffle.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.findMany({
      where: { status: "paid" },
      include: { user: true, raffle: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const revenue = await prisma.order.aggregate({
    where: { status: "paid" },
    _sum: { amount: true },
  });

  const activeRaffle = raffles.find((r) => r.status === "active");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#3C3B6E" }}>
          🛡️ Admin Dashboard
        </h1>
        <Link href="/admin/new-raffle" className="btn-primary">
          + New Raffle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Revenue", value: `$${(revenue._sum.amount || 0).toLocaleString()}`, color: "#16a34a" },
          { label: "Tickets Sold", value: orders, color: "#B22234" },
          { label: "Total Users", value: users, color: "#3C3B6E" },
          { label: "Active Raffles", value: raffles.filter((r) => r.status === "active").length, color: "#7c3aed" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-md p-5 text-center">
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-gray-500 text-sm font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Raffle Management */}
      {activeRaffle && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <h2 className="text-xl font-black mb-4" style={{ color: "#3C3B6E" }}>
            🎟️ Active Raffle Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">{activeRaffle.title}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tickets</span>
                  <span className="font-bold">{activeRaffle.totalTickets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sold</span>
                  <span className="font-bold text-red-600">{activeRaffle.soldTickets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-bold text-green-600">
                    {(activeRaffle.totalTickets - activeRaffle.soldTickets).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-bold">
                    ${(activeRaffle.soldTickets * activeRaffle.ticketPrice).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${Math.round((activeRaffle.soldTickets / activeRaffle.totalTickets) * 100)}%`,
                      background: "#B22234",
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round((activeRaffle.soldTickets / activeRaffle.totalTickets) * 100)}% sold
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/admin/raffle/${activeRaffle.id}`} className="btn-blue text-center">
                Edit Raffle Details
              </Link>
              <AdminRaffleActions raffleId={activeRaffle.id} status={activeRaffle.status} />
            </div>
          </div>
        </div>
      )}

      {/* All Raffles */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
        <h2 className="text-xl font-black mb-4" style={{ color: "#3C3B6E" }}>All Raffles</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Car</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Sold / Total</th>
                <th className="text-left px-4 py-3">Revenue</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-bold">{r.title}</td>
                  <td className="px-4 py-3">{r.carYear} {r.carMake} {r.carModel}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      r.status === "active" ? "bg-green-100 text-green-700" :
                      r.status === "completed" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.soldTickets} / {r.totalTickets}</td>
                  <td className="px-4 py-3">${(r.soldTickets * r.ticketPrice).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/raffle/${r.id}`} className="text-blue-600 hover:underline text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {raffles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No raffles yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-black mb-4" style={{ color: "#3C3B6E" }}>Recent Ticket Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Raffle</th>
                <th className="text-left px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={order.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">
                    <div className="font-bold">{order.user.name}</div>
                    <div className="text-gray-400 text-xs">{order.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{order.raffle.carYear} {order.raffle.carMake}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3 font-bold">${order.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
