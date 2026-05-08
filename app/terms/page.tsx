export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-2" style={{ color: "#3C3B6E" }}>Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <p>By participating in American Raffle, you agree to these terms and conditions.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Eligibility</h2>
        <p>Participants must be 18 years of age or older and legal US residents. Employees of American Raffle Foundation and their immediate family members are not eligible.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>No Purchase Necessary</h2>
        <p>No purchase is necessary to enter or win. See the Free Tickets page for the Alternative Method of Entry (AMOE).</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Prize</h2>
        <p>The prize is as described on the raffle page. All applicable taxes and fees are covered by American Raffle Foundation. The winner has 30 days from notification to claim their prize.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Drawing</h2>
        <p>The winner is selected via a certified random number generator. The drawing is conducted live and is verifiable. American Raffle&apos;s decisions are final.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Refunds</h2>
        <p>All ticket sales are final and non-refundable except as required by law.</p>
        <h2 className="text-xl font-black" style={{ color: "#3C3B6E" }}>Contact</h2>
        <p>Questions? Email <a href="mailto:legal@americanraffle.com" className="underline">legal@americanraffle.com</a></p>
      </div>
    </div>
  );
}
