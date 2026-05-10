"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  return (
    <nav style={{ background: "#3C3B6E" }} className="text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wide">
            <span className="text-2xl">🇺🇸</span>
            <span style={{ color: "#FFFFFF" }}>AMERICAN</span>
            <span style={{ color: "#B22234" }}>RAFFLE</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/raffle" className="hover:text-red-300 transition-colors">Current Raffle</Link>
            <Link href="/how-it-works" className="hover:text-red-300 transition-colors">How It Works</Link>
            <Link href="/free-tickets" className="hover:text-red-300 transition-colors">Free Tickets</Link>
            <Link href="/merch" className="hover:text-red-300 transition-colors">Merch Store</Link>
            <Link href="/past-raffles" className="hover:text-red-300 transition-colors">Winners</Link>
            <Link href="/about" className="hover:text-red-300 transition-colors">About</Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-yellow-300 transition-colors">Admin</Link>
            )}
            {session ? (
              <>
                <Link href="/account" className="hover:text-red-300 transition-colors">My Tickets</Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded font-bold transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-red-300 transition-colors">Login</Link>
                <Link
                  href="/register"
                  style={{ background: "#B22234" }}
                  className="hover:opacity-90 px-4 py-1.5 rounded font-bold transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700 flex flex-col gap-3 text-sm font-semibold">
            <Link href="/raffle" onClick={() => setMenuOpen(false)} className="hover:text-red-300">Current Raffle</Link>
            <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-red-300">How It Works</Link>
            <Link href="/free-tickets" onClick={() => setMenuOpen(false)} className="hover:text-red-300">Free Tickets</Link>
            <Link href="/merch" onClick={() => setMenuOpen(false)} className="hover:text-red-300">Merch Store</Link>
            <Link href="/past-raffles" onClick={() => setMenuOpen(false)} className="hover:text-red-300">Winners</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-red-300">About</Link>
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Admin</Link>}
            {session ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="hover:text-red-300">My Tickets</Link>
                <button onClick={() => signOut()} className="text-left text-red-300">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="text-red-300">Sign Up Free</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
