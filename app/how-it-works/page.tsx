export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        className="text-white py-20 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">How It Works</h1>
        <p className="text-blue-100 text-xl max-w-2xl mx-auto">
          Transparent, legal, and simple — here&apos;s everything you need to know about our charity car raffle.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-title">The Raffle Process</h2>
        <div className="stars-divider">★ ★ ★</div>

        <div className="space-y-8">
          {[
            {
              step: "01",
              icon: "🚗",
              title: "We Partner with Dealerships",
              desc: "American Raffle partners with patriotic car dealerships across the country to provide the prize vehicle at a special charitable rate. The dealer donates the car at cost, and we cover all title transfer and registration fees.",
            },
            {
              step: "02",
              icon: "🎟️",
              title: "Tickets Go on Sale at $10 Each",
              desc: "Once a raffle opens, tickets are sold at $10 per ticket. Every ticket is numbered and securely recorded in our system. You can buy up to 100 tickets per raffle. The more tickets you hold, the better your odds.",
            },
            {
              step: "03",
              icon: "📊",
              title: "Watch the Odds Update in Real Time",
              desc: "As tickets sell, our website shows live updates on tickets remaining and your approximate odds. Everything is fully transparent — you always know exactly where you stand.",
            },
            {
              step: "04",
              icon: "🎲",
              title: "Live Random Drawing",
              desc: "When all tickets are sold (or a set deadline is reached), we conduct a live-streamed random drawing on our website and YouTube channel. A certified random number generator selects the winning ticket number. It&apos;s all recorded and verifiable.",
            },
            {
              step: "05",
              icon: "🏆",
              title: "Winner is Notified",
              desc: "The winning ticket holder is notified by email and phone. We verify their identity and coordinate the prize delivery. The winner has 30 days to claim their prize.",
            },
            {
              step: "06",
              icon: "💰",
              title: "We Cover All Taxes & Fees",
              desc: "American Raffle covers all applicable federal and state taxes on the prize. The winner walks away with a clean title, zero tax burden, and full registration. What you see is what you get — no surprises.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 bg-white rounded-2xl shadow-md p-6">
              <div className="flex-shrink-0">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg"
                  style={{ background: "#B22234" }}
                >
                  {item.step}
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-black text-xl mb-2" style={{ color: "#3C3B6E" }}>{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tax Coverage */}
      <section style={{ background: "#f0f4ff" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title">Tax Coverage Explained</h2>
          <div className="stars-divider">★ ★ ★</div>
          <div className="bg-white rounded-2xl shadow-md p-8">
            <p className="text-gray-700 mb-4 text-lg">
              Winning a car in a traditional raffle or giveaway typically means paying income tax on the full
              retail value of the vehicle — which can be <strong>$8,000 – $15,000</strong> or more. Many winners
              are unable to accept their prize because they can&apos;t afford the tax bill.
            </p>
            <p className="text-gray-700 mb-4">
              <strong style={{ color: "#B22234" }}>American Raffle is different.</strong> We work with our
              501(c)(3) charitable foundation to structure the prize delivery so that the tax obligation is
              covered by the organization, not the winner. Our legal and accounting team ensures full compliance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-red-50 rounded-xl p-4">
                <div className="font-bold text-red-700 mb-2">❌ Typical Giveaway</div>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Win a $40,000 car</li>
                  <li>• Owe ~$10,000+ in income tax</li>
                  <li>• Must pay before claiming prize</li>
                  <li>• Many winners can&apos;t afford it</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="font-bold text-green-700 mb-2">✅ American Raffle</div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Win a $40,000 car</li>
                  <li>• $0 in taxes for you</li>
                  <li>• We handle all paperwork</li>
                  <li>• Just show up and drive away</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealership Partnership */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-title">Dealership Partnership Program</h2>
        <div className="stars-divider">★ ★ ★</div>
        <div className="bg-white rounded-2xl shadow-md p-8">
          <p className="text-gray-700 mb-4">
            We partner with independently-owned American car dealerships who share our values of patriotism,
            veteran support, and community giving. Our dealer partners:
          </p>
          <ul className="space-y-3 text-gray-700">
            {[
              "Provide the prize vehicle at a special below-MSRP charitable rate",
              "Receive significant brand exposure to our national audience",
              "Get featured on our website, social media, and press coverage",
              "Qualify for charitable donation tax deductions",
              "Join a network of patriotic, community-focused businesses",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-0.5">★</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Interested in partnering?</strong> Email us at{" "}
              <a href="mailto:dealers@americanraffle.com" className="underline">
                dealers@americanraffle.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section style={{ background: "#3C3B6E" }} className="text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-4">100% Legal Nationwide</h2>
          <p className="text-blue-200 mb-4">
            American Raffle operates as a registered 501(c)(3) nonprofit charitable organization.
            Our raffles are structured as charitable sweepstakes with no purchase necessary alternative
            method of entry (AMOE), making them legal in all 50 states.
          </p>
          <p className="text-sm text-blue-300">
            No purchase necessary. Void where prohibited. See official rules for full details.
          </p>
        </div>
      </section>
    </div>
  );
}
