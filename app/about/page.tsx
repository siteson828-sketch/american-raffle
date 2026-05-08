export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #3C3B6E, #B22234)" }}
        className="text-white py-20 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">About American Raffle</h1>
        <p className="text-blue-100 text-xl max-w-2xl mx-auto">
          A 501(c)(3) nonprofit giving back to the heroes who gave everything for this country.
        </p>
      </section>

      {/* Mission */}
      <section id="charity" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-title">Our Mission</h2>
        <div className="stars-divider">★ ★ ★</div>
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-6xl mb-6">🇺🇸</div>
          <blockquote className="text-2xl font-bold italic text-gray-800 mb-6" style={{ color: "#3C3B6E" }}>
            "To support America&apos;s veterans through innovative charitable fundraising — one ticket, one car,
            one life changed at a time."
          </blockquote>
          <p className="text-gray-600 text-lg">
            American Raffle Foundation was founded on the belief that every veteran deserves support after
            their service, and every American deserves the chance to make a difference — and maybe win a car
            while doing it. We make giving fun, transparent, and impactful.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ background: "#f0f4ff" }} className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title">Our Impact</h2>
          <div className="stars-divider">★ ★ ★</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "$2.4M+", label: "Raised for Veterans", icon: "💰" },
              { num: "847", label: "Veterans Helped", icon: "🎖️" },
              { num: "12", label: "Cars Given Away", icon: "🚗" },
              { num: "50", label: "States Served", icon: "🗺️" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-md p-6 text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-black mb-1" style={{ color: "#B22234" }}>{stat.num}</div>
                <div className="text-gray-600 text-sm font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-title">Programs We Fund</h2>
        <div className="stars-divider">★ ★ ★</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🏠",
              title: "Veteran Housing",
              desc: "Emergency housing assistance and down payment grants for homeless and at-risk veterans.",
            },
            {
              icon: "⚕️",
              title: "Mental Health Care",
              desc: "Funding PTSD treatment, counseling, and crisis intervention programs nationwide.",
            },
            {
              icon: "💼",
              title: "Job Training",
              desc: "Career transition programs helping veterans translate their skills to civilian careers.",
            },
            {
              icon: "🎓",
              title: "Education Grants",
              desc: "Scholarships and education grants for veterans and their families.",
            },
            {
              icon: "👨‍👩‍👧",
              title: "Family Support",
              desc: "Resources and counseling for military families dealing with deployment and transition.",
            },
            {
              icon: "🏥",
              title: "Medical Equipment",
              desc: "Prosthetics, wheelchairs, and adaptive equipment for injured veterans.",
            },
          ].map((prog) => (
            <div key={prog.title} className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-4xl mb-3">{prog.icon}</div>
              <h3 className="font-black text-lg mb-2" style={{ color: "#3C3B6E" }}>{prog.title}</h3>
              <p className="text-gray-600 text-sm">{prog.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 501c3 Info */}
      <section style={{ background: "#3C3B6E" }} className="text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-8">501(c)(3) Status & Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 text-red-300">Legal Status</h3>
              <ul className="space-y-3 text-blue-100">
                {[
                  "Registered 501(c)(3) nonprofit organization",
                  "EIN: [XX-XXXXXXX]",
                  "Incorporated in the State of [State]",
                  "Annual Form 990 filed with the IRS",
                  "Audited financial statements available upon request",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-red-300">★</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4 text-red-300">How Funds Are Used</h3>
              <div className="space-y-3">
                {[
                  { label: "Veteran Programs", pct: 72, color: "#B22234" },
                  { label: "Operations", pct: 18, color: "#5a6abf" },
                  { label: "Prize (Car + Taxes)", pct: 10, color: "#7ca3e0" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.pct}%</span>
                    </div>
                    <div className="bg-blue-800 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{ width: `${item.pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="section-title">Our Team</h2>
        <div className="stars-divider">★ ★ ★</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Col. James Walker (Ret.)", role: "Founder & CEO", branch: "U.S. Army — 22 Years" },
            { name: "Sarah Mitchell, CPA", role: "CFO & Treasurer", branch: "Financial Transparency Lead" },
            { name: "Cmdr. Lisa Chen (Ret.)", role: "Director of Programs", branch: "U.S. Navy — 18 Years" },
          ].map((person) => (
            <div key={person.name} className="bg-white rounded-2xl shadow-md p-6 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: "#f0f4ff" }}
              >
                👤
              </div>
              <h3 className="font-black text-lg" style={{ color: "#3C3B6E" }}>{person.name}</h3>
              <div className="text-red-600 font-semibold text-sm">{person.role}</div>
              <div className="text-gray-500 text-xs mt-1">{person.branch}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
