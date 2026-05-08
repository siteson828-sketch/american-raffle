export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-2" style={{ color: "#3C3B6E" }}>Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="space-y-6 text-gray-700">
        <p>American Raffle Foundation is committed to protecting your privacy.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>What We Collect</h2>
        <p>We collect your name, email address, and payment information (processed securely by Stripe — we never store card numbers).</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>How We Use It</h2>
        <p>Your information is used to manage your account, process ticket purchases, send raffle updates, and comply with legal requirements.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>We Never Sell Your Data</h2>
        <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Security</h2>
        <p>We use industry-standard encryption and security practices to protect your information.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Contact</h2>
        <p>Privacy questions? Email <a href="mailto:privacy@americanraffle.com" className="underline">privacy@americanraffle.com</a></p>
      </div>
    </div>
  );
}
