import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#3C3B6E" }} className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-black text-lg mb-3">
              <span>🇺🇸</span>
              <span>AMERICAN RAFFLE</span>
            </div>
            <p className="text-blue-200 text-sm">
              Giving back to those who served, one ticket at a time.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-red-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/raffle" className="hover:text-white">Current Raffle</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link href="/free-tickets" className="hover:text-white">Free Tickets</Link></li>
              <li><Link href="/merch" className="hover:text-white">Merch Store</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-red-300">Support</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/about#charity" className="hover:text-white">Our Charity</Link></li>
              <li><a href="mailto:support@americanraffle.com" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-red-300">Legal</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><span>501(c)(3) Registered</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-700 mt-8 pt-8 text-center text-sm text-blue-300">
          <p>★ ★ ★ &nbsp; American Raffle &nbsp; ★ ★ ★</p>
          <p className="mt-1">© {new Date().getFullYear()} American Raffle Foundation. All rights reserved.</p>
          <p className="mt-1 text-xs">No purchase necessary. Void where prohibited. See rules for details.</p>
        </div>
      </div>
    </footer>
  );
}
