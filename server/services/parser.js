const PROVIDERS = [
  { name: 'Easypaisa', match: /easypaisa|telenorbank|telenor microfinance/i },
  { name: 'NayaPay', match: /nayapay/i },
  { name: 'JazzCash', match: /jazzcash|jazz cash|mobilink microfinance/i },
  { name: 'SadaPay', match: /sadapay/i },
];

const CREDIT = /\b(received|credited|deposit(ed)?|refund(ed)?|cashback)\b/i;
const DEBIT = /\b(sent|paid|payment|transferred|transfer|purchase(d)?|debited|withdraw(n|al)?|bill|recharge|top-?up|spent)\b/i;

const num = (s) => parseFloat(s.replace(/,/g, ''));
const clean = (s) => s?.replace(/\s+/g, ' ').trim() || null;
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Amount: prefer the "Total" line (includes fees), then the first "Rs. X"
const AMOUNT_PATTERNS = [
  /\bTotal\s*[:\t ]\s*(?:rs\.?|pkr)\s*([\d,]+(?:\.\d+)?)/i,
  /\b(?:rs\.?|pkr|rupees)\s*[:.]?\s*([\d,]+(?:\.\d+)?)/i,
  /([\d,]+(?:\.\d+)?)\s*(?:pkr|\brs\b)/i,
];

// Easypaisa receipt fields (works on plain text and on HTML collapsed to one line)
const FIELD_END = '(?=\\s*[\\n\\t]|\\s+(?:Receiver Number|Sender Number|Sender Name|Receiver Name|AMOUNT|Transaction|Date)\\b|$)';
const field = (text, label) => clean(text.match(new RegExp(`${label}\\s*[:\\t ]\\s*(.+?)${FIELD_END}`, 'i'))?.[1]);

// "Date & Time    05-Oct-2026 11:26:45"  (Pakistan time)
function parseTxnDate(text) {
  const m = text.match(/Date\s*&\s*Time\s*[:\t ]\s*(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{2}:\d{2}:\d{2})/i);
  if (!m) return null;
  const d = new Date(`${m[1]} ${m[2]} ${m[3]} ${m[4]} GMT+0500`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Generic fallback for other wallets: "... to <name> ..."
const MERCHANT =
  /\bto\s+([A-Za-z0-9][A-Za-z0-9 &.'-]{1,40}?)(?=\s+(?:on|at|via|from|for|with|ref|trx|tid|was)\b|[.,\n]|$)/i;

/**
 * Returns { provider, amount, merchant, transactionId, date } for an expense
 * email, or null when it is not an expense (e.g. money you received).
 * `userName` is the Google account name, used to tell sent from received.
 */
export function parseEmail({ from, subject, body, userName }) {
  const text = `${subject}\n${body}`;
  const provider = PROVIDERS.find((p) => p.match.test(from) || p.match.test(text))?.name;
  if (!provider) return null;

  const sender = field(text, 'Sender Name');
  const receiver = field(text, 'Receiver Name');

  // If the receipt names the receiver and it is the account owner, it's income
  if (receiver && sender && userName && norm(receiver) === norm(userName) && norm(sender) !== norm(userName)) return null;

  if (!DEBIT.test(text)) return null;
  if (CREDIT.test(subject) && !DEBIT.test(subject)) return null;

  let amount = null;
  for (const re of AMOUNT_PATTERNS) {
    const m = text.match(re);
    if (m) { amount = num(m[1]); break; }
  }
  if (!amount || Number.isNaN(amount)) return null;

  return {
    provider,
    amount,
    merchant: receiver || clean(text.match(MERCHANT)?.[1]),
    transactionId: field(text, 'Transaction ID'),
    date: parseTxnDate(text),
  };
}
