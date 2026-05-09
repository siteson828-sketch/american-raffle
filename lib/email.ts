import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "American Raffle <noreply@americanraffle.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://american-raffle-ten.vercel.app";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#3C3B6E,#B22234);padding:32px 40px;text-align:center}
  .header h1{margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px}
  .header p{margin:6px 0 0;color:rgba(255,255,255,.75);font-size:14px}
  .body{padding:32px 40px}
  .footer{background:#f9f9f9;border-top:1px solid #eee;padding:20px 40px;text-align:center;font-size:12px;color:#999}
  .btn{display:inline-block;background:#B22234;color:#fff!important;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;margin:16px 0}
  .stat{display:inline-block;background:#f5f5f5;border-radius:8px;padding:12px 20px;margin:6px;text-align:center}
  .stat-val{font-size:24px;font-weight:900;color:#3C3B6E}
  .stat-lbl{font-size:12px;color:#777;margin-top:2px}
  h2{color:#3C3B6E;margin-top:0}
  p{color:#444;line-height:1.6;font-size:15px}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>🇺🇸 American Raffle</h1>
    <p>Supporting American Veterans</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    American Raffle · 501(c)(3) Nonprofit · Supporting U.S. Veterans<br/>
    <a href="${BASE_URL}/terms" style="color:#999">Terms</a> &nbsp;·&nbsp;
    <a href="${BASE_URL}/privacy" style="color:#999">Privacy</a>
  </div>
</div>
</body></html>`;
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, referralCode: string) {
  const referralUrl = `${BASE_URL}/register?ref=${referralCode}`;
  await send(to, "Welcome to American Raffle! 🎉🇺🇸", layout(`
    <h2>Welcome, ${name}! 🎉</h2>
    <p>You're officially part of the American Raffle community — where every $10 ticket could win you a brand new car <em>and</em> supports U.S. veterans.</p>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/raffle">🎟️ Buy Your First Ticket</a></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
    <h2>🎁 Earn Free Tickets</h2>
    <p>Share your personal referral link and earn <strong>1 free ticket</strong> for every friend who joins and buys a ticket!</p>
    <div style="background:#f0f4ff;border-radius:8px;padding:16px;font-family:monospace;font-size:13px;word-break:break-all;color:#3C3B6E">${referralUrl}</div>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/account">View My Account →</a></p>
  `));
}

// ─── Trial warning emails ──────────────────────────────────────────────────────

export async function sendTrialWarningEmail(to: string, name: string, daysLeft: number, trialEndsAt: Date) {
  const urgent = daysLeft === 1;
  await send(to, `⚠️ Your free trial ${urgent ? "expires tomorrow" : `ends in ${daysLeft} days`}`, layout(`
    <h2>${urgent ? "🚨 Last chance!" : "⏳ Trial ending soon"}</h2>
    <p>Hi ${name}, your American Raffle free trial ${urgent ? "expires <strong>tomorrow</strong>" : `ends in <strong>${daysLeft} days</strong>`} on <strong>${trialEndsAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.</p>
    <p>Don't lose access — upgrade now to keep entering raffles and earning free tickets.</p>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/raffle">🎟️ Enter Now Before It Expires</a></p>
    <p style="color:#999;font-size:13px">Questions? Reply to this email and we'll help.</p>
  `));
}

// ─── Payment confirmation ──────────────────────────────────────────────────────

export async function sendPaymentConfirmation(
  to: string,
  name: string,
  quantity: number,
  amount: number,
  raffleName: string,
  ticketNums: number[]
) {
  const ticketList = ticketNums
    .map((n) => `<strong>#${n.toString().padStart(6, "0")}</strong>`)
    .join(", ");
  await send(to, `✅ ${quantity} ticket${quantity > 1 ? "s" : ""} confirmed — ${raffleName}`, layout(`
    <h2>Payment Confirmed! ✅</h2>
    <p>Hi ${name}, your purchase is confirmed. Good luck in the drawing!</p>
    <div style="background:#f0fff4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:16px 0">
      <p style="margin:0 0 8px;font-weight:700;color:#166534">${raffleName}</p>
      <p style="margin:0;color:#444">Tickets: ${ticketList}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#777">${quantity} ticket${quantity > 1 ? "s" : ""} · $${amount.toFixed(2)} total</p>
    </div>
    <p>Remember — every ticket sold helps fund veteran housing, healthcare, and job training.</p>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/account">View My Tickets</a></p>
  `));
}

// ─── Winner notification (to winner) ──────────────────────────────────────────

export async function sendWinnerNotification(
  to: string,
  name: string,
  raffleName: string,
  ticketNum: number,
  verificationHash: string,
  raffleId: string
) {
  await send(to, `🏆 YOU WON! — ${raffleName}`, layout(`
    <h2 style="color:#B22234">🏆 Congratulations, ${name}!</h2>
    <p style="font-size:18px;font-weight:700">You are the winner of the <em>${raffleName}</em>!</p>
    <div style="background:linear-gradient(135deg,#3C3B6E,#B22234);border-radius:12px;padding:24px;text-align:center;margin:20px 0">
      <p style="color:#fff;margin:0;font-size:13px;opacity:.8">Winning Ticket</p>
      <p style="color:#FFD700;font-size:36px;font-weight:900;margin:4px 0;font-family:monospace">#${ticketNum.toString().padStart(6, "0")}</p>
    </div>
    <p>Our team will be in touch within 48 hours to arrange delivery. Please have your government-issued ID ready.</p>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/verify/${raffleId}">🔍 Verify Your Drawing</a></p>
    <p style="font-size:12px;color:#999">Verification hash: <code style="font-family:monospace">${verificationHash.slice(0, 24)}…</code></p>
  `));
}

// ─── Winner notification (to dealer) ──────────────────────────────────────────

export async function sendDealerWinnerNotification(
  dealerEmail: string,
  dealerName: string,
  raffleName: string,
  winnerName: string,
  winnerEmail: string,
  ticketNum: number,
  payoutAmount: number | null,
  transferId: string | null,
  verificationHash: string,
  raffleId: string
) {
  await send(dealerEmail, `Drawing complete — ${raffleName}`, layout(`
    <h2>Drawing Complete 🎲</h2>
    <p>Hi ${dealerName}, the drawing for <strong>${raffleName}</strong> has been conducted and recorded.</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:16px 0">
      <p style="margin:0 0 6px"><strong>Winner:</strong> ${winnerName} (${winnerEmail})</p>
      <p style="margin:0 0 6px"><strong>Winning Ticket:</strong> #${ticketNum.toString().padStart(6, "0")}</p>
      ${payoutAmount ? `<p style="margin:0 0 6px"><strong>Payout:</strong> $${payoutAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} via Stripe (${transferId})</p>` : ""}
    </div>
    <p>The drawing is publicly verifiable. Share the link below with participants:</p>
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/verify/${raffleId}">🔍 Public Verification Page</a></p>
    <p style="font-size:12px;color:#999">Verification hash: <code>${verificationHash.slice(0, 24)}…</code></p>
  `));
}

// ─── Daily dealer summary ──────────────────────────────────────────────────────

export async function sendDailySummary(
  to: string,
  name: string,
  raffleName: string,
  ticketsSoldToday: number,
  totalSold: number,
  totalTickets: number,
  revenueToday: number,
  totalRevenue: number
) {
  const pct = Math.round((totalSold / totalTickets) * 100);
  const progressBar = `<div style="background:#e5e7eb;border-radius:99px;height:12px;margin:8px 0"><div style="background:#B22234;height:12px;border-radius:99px;width:${pct}%"></div></div>`;
  await send(to, `📊 Daily Raffle Summary — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, layout(`
    <h2>📊 Daily Summary</h2>
    <p>Hi ${name}, here's today's snapshot for <strong>${raffleName}</strong>:</p>
    <div style="text-align:center;margin:20px 0">
      <div class="stat"><div class="stat-val">${ticketsSoldToday}</div><div class="stat-lbl">Tickets Today</div></div>
      <div class="stat"><div class="stat-val">$${revenueToday.toLocaleString()}</div><div class="stat-lbl">Revenue Today</div></div>
      <div class="stat"><div class="stat-val">${totalSold.toLocaleString()}</div><div class="stat-lbl">Total Sold</div></div>
      <div class="stat"><div class="stat-val">$${totalRevenue.toLocaleString()}</div><div class="stat-lbl">Total Revenue</div></div>
    </div>
    <p><strong>Overall progress:</strong> ${totalSold.toLocaleString()} / ${totalTickets.toLocaleString()} tickets (${pct}%)</p>
    ${progressBar}
    <p style="text-align:center"><a class="btn" href="${BASE_URL}/admin">View Full Dashboard →</a></p>
  `));
}
