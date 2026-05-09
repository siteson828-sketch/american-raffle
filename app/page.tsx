import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getActiveRaffle() {
  try {
    return await prisma.raffle.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const raffle = await getActiveRaffle();
  const ticketsLeft = raffle ? raffle.totalTickets - raffle.soldTickets : 0;
  const oddsPercent = raffle
    ? ((1 / raffle.totalTickets) * 100).toFixed(4)
    : "0";

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)",
        }}
        className="text-white relative overflow-hidden"
      >
        {/* Stars pattern */}
        <div className="absolute inset-0 opacity-10 text-8xl select-none pointer-events-none flex flex-wrap gap-8 p-8">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center">
            <div className="inline-block bg-red-600 text-white text-xs font-black px-4 py-1 rounded-full mb-6 tracking-widest uppercase">
              🇺🇸 Supporting American Veterans
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
              WIN A FREE CAR
              <br />
              <span style={{ color: "#FFD700" }}>FOR $10</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-2xl mx-auto">
              {raffle
                ? `Enter to win the ${raffle.carYear} ${raffle.carMake} ${raffle.carModel} — valued at $${raffle.carMsrp.toLocaleString()}`
                : "Enter our patriotic charity car raffle for just $10 per ticket"}
            </p>
            <p className="text-blue-200 mb-10 text-lg">
              Taxes & fees covered. 100% legal nationwide. Proceeds support veterans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/raffle"
                className="btn-primary text-lg px-8 py-4 text-center"
                style={{ background: "#B22234", fontSize: "1.25rem" }}
              >
                🎟️ Buy Tickets — $10 Each
              </Link>
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-4 text-center font-black"
                style={{ background: "#FFD700", color: "#3C3B6E", fontSize: "1.25rem" }}
              >
                🚀 Get Started Free
              </Link>
              <Link
                href="/free-tickets"
                className="btn-blue text-lg px-8 py-4 text-center"
                style={{ background: "rgba(255,255,255,0.15)", fontSize: "1.25rem" }}
              >
                Get Free Tickets →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#B22234" }} className="text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm font-bold">
            {raffle && (
              <>
                <div>
                  <span className="text-2xl font-black">{ticketsLeft.toLocaleString()}</span>
                  <br />
                  <span className="text-red-200">Tickets Remaining</span>
                </div>
                <div className="hidden sm:block text-red-300">|</div>
                <div>
                  <span className="text-2xl font-black">{raffle.soldTickets.toLocaleString()}</span>
                  <br />
                  <span className="text-red-200">Tickets Sold</span>
                </div>
                <div className="hidden sm:block text-red-300">|</div>
                <div>
                  <span className="text-2xl font-black">1:{raffle.totalTickets.toLocaleString()}</span>
                  <br />
                  <span className="text-red-200">Odds of Winning</span>
                </div>
                <div className="hidden sm:block text-red-300">|</div>
              </>
            )}
            <div>
              <span className="text-2xl font-black">$0</span>
              <br />
              <span className="text-red-200">Taxes for Winner</span>
            </div>
            <div className="hidden sm:block text-red-300">|</div>
            <div>
              <span className="text-2xl font-black">100%</span>
              <br />
              <span className="text-red-200">Legal Nationwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Current Raffle Feature */}
      {raffle && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="section-title">Current Raffle</h2>
          <div className="stars-divider">★ ★ ★</div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <div className="md:flex">
              <div
                className="md:w-1/2 bg-gray-200 flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                {(() => {
                  let photos: string[] = [];
                  try { photos = JSON.parse(raffle.photos); } catch {}
                  return photos[0] ? (
                    <img src={photos[0]} alt={raffle.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400 p-8">
                      <div className="text-6xl mb-4">🚗</div>
                      <p className="font-bold text-lg">{raffle.carYear} {raffle.carMake} {raffle.carModel}</p>
                    </div>
                  );
                })()}
              </div>
              <div className="md:w-1/2 p-8">
                <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                  ● Live Now
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{raffle.title}</h3>
                <p className="text-gray-600 mb-4">{raffle.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="font-bold text-blue-800">Car Value</div>
                    <div className="text-blue-600">${raffle.carMsrp.toLocaleString()}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="font-bold text-red-800">Ticket Price</div>
                    <div className="text-red-600">${raffle.ticketPrice}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="font-bold text-green-800">Tickets Left</div>
                    <div className="text-green-600">{ticketsLeft.toLocaleString()}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="font-bold text-yellow-800">Win Odds</div>
                    <div className="text-yellow-600">1 in {raffle.totalTickets.toLocaleString()}</div>
                  </div>
                </div>
                {raffle.taxCovered && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4 text-sm text-green-800 font-semibold">
                    ✅ All taxes & fees covered by American Raffle!
                  </div>
                )}
                <Link href="/raffle" className="btn-primary w-full text-center block">
                  🎟️ Buy Tickets Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section style={{ background: "#f0f4ff" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title">How It Works</h2>
          <div className="stars-divider">★ ★ ★</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: "🎟️", title: "Buy Tickets", desc: "Get raffle tickets for just $10 each. The more you buy, the better your odds." },
              { step: "2", icon: "🎲", title: "Live Drawing", desc: "When all tickets sell, we hold a live-streamed random drawing. Fully transparent." },
              { step: "3", icon: "🏆", title: "You Win!", desc: "Winner gets the car title transferred to them, with all taxes and fees paid by us." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div
                  className="w-10 h-10 rounded-full text-white font-black text-lg flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#B22234" }}
                >
                  {item.step}
                </div>
                <h3 className="font-black text-xl mb-2" style={{ color: "#3C3B6E" }}>{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/how-it-works" className="btn-blue">Learn More →</Link>
          </div>
        </div>
      </section>

      {/* Free Tickets CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div
          className="rounded-2xl p-10 text-center text-white"
          style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        >
          <h2 className="text-3xl font-black mb-4">Get FREE Tickets!</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-xl mx-auto">
            Refer friends or purchase American Raffle merchandise to earn free raffle entries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-tickets" className="btn-primary px-8 py-3">
              🎁 Earn Free Tickets
            </Link>
            <Link href="/merch" style={{ background: "rgba(255,255,255,0.15)" }} className="btn-primary px-8 py-3">
              🛍️ Shop Merch
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="section-title">What Winners Say</h2>
        <div className="stars-divider">★ ★ ★</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "James T., Texas",
              quote: "I bought 5 tickets on a whim and won a brand-new F-150. Still can't believe it. American Raffle is the real deal — transparent drawing, car delivered to my door.",
              stars: 5,
              avatar: "🤠",
            },
            {
              name: "Maria S., Florida",
              quote: "The whole process was so easy. I entered online, got my ticket numbers by email, and watched the live drawing on their YouTube. Everything was exactly as advertised.",
              stars: 5,
              avatar: "🌟",
            },
            {
              name: "Robert K., Ohio",
              quote: "Taxes and fees covered — that's what sold me. Other raffles hide that. American Raffle put it right on the page and followed through. Plus my entry helped veterans.",
              stars: 5,
              avatar: "🎖️",
            },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl shadow-md p-8 flex flex-col">
              <div className="text-4xl mb-4">{t.avatar}</div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} style={{ color: "#FFD700" }} className="text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-black text-sm" style={{ color: "#3C3B6E" }}>{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#f0f4ff" }} className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="stars-divider">★ ★ ★</div>
          <div className="space-y-4">
            {[
              {
                q: "Is this legal?",
                a: "Yes — American Raffle operates as a 501(c)(3) nonprofit charitable raffle, which is legal in all 50 states. Our drawings comply with all applicable state charitable gaming laws.",
              },
              {
                q: "Do I really pay $0 in taxes if I win?",
                a: "Correct. American Raffle covers all federal and state tax liability on the prize value, as well as title transfer fees and registration. You receive the car free and clear.",
              },
              {
                q: "How is the winner chosen?",
                a: "Winners are selected using a cryptographically secure random number generator (Node.js crypto.randomBytes). The drawing is logged with a publicly verifiable SHA-256 hash so anyone can confirm the result was not manipulated.",
              },
              {
                q: "What if the raffle doesn't sell out?",
                a: "If a raffle does not sell all tickets by the announced close date, we extend the deadline or draw from the tickets sold — whichever is specified in that raffle's rules. Details are posted on the active raffle page.",
              },
              {
                q: "How do I get free tickets?",
                a: "Refer a friend who makes their first purchase and you both receive a free ticket. You can also earn free entries by purchasing American Raffle merchandise. Visit the Free Tickets page for details.",
              },
              {
                q: "Can I buy tickets as a gift?",
                a: "Yes! Create an account, purchase tickets, and you can transfer them to anyone. Contact support after purchase and we'll update the ticket holder name.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderColor: "#B22234" }}>
                <h3 className="font-black text-lg mb-2" style={{ color: "#3C3B6E" }}>{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="btn-primary px-10 py-4 text-lg font-black inline-block">
              🚀 Get Started Free — No Credit Card Required
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: "#3C3B6E" }} className="text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Our Mission</h2>
          <div className="text-blue-200 text-4xl mb-6">★ ★ ★</div>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            American Raffle is a 501(c)(3) nonprofit dedicated to supporting United States military veterans
            through innovative charitable fundraising. Every ticket sold goes directly toward veteran housing,
            healthcare, and job training programs. We believe every American hero deserves support — and one
            lucky winner deserves a brand new car.
          </p>
          <Link href="/about" className="btn-primary">
            Our Story & Impact →
          </Link>
        </div>
      </section>
    </div>
  );
}
