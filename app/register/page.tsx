"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const refCode = params.get("ref") || "";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", ref: refCode, phone: "", smsOptIn: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, referralCode: form.ref, phone: form.phone, smsOptIn: form.smsOptIn }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/account");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="John Smith"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="Min. 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          required
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="Repeat password"
        />
      </div>
      {/* Optional phone + SMS consent */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">SMS Alerts (Optional)</p>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.smsOptIn}
            onChange={(e) => setForm((f) => ({ ...f, smsOptIn: e.target.checked }))}
            className="mt-0.5 w-4 h-4 accent-red-600 flex-shrink-0"
          />
          <span className="text-xs text-gray-600">
            I consent to receive SMS messages from American Raffle. Msg &amp; data rates may apply.
            Reply <strong>STOP</strong> to cancel anytime. Consent is not required to purchase.
          </span>
        </label>
      </div>

      {refCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          🎁 You were referred! Complete registration to claim your free bonus ticket.
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg text-white font-black text-lg disabled:opacity-60"
        style={{ background: "#B22234" }}
      >
        {loading ? "Creating Account..." : "Create Free Account"}
      </button>
      <p className="text-center text-sm text-gray-500">
        By registering you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold" style={{ color: "#B22234" }}>Sign in</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f0f4ff" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🇺🇸</div>
          <h1 className="text-3xl font-black" style={{ color: "#3C3B6E" }}>Join American Raffle</h1>
          <p className="text-gray-600 mt-1">Create your free account and start winning</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
