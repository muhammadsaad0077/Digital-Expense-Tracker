import { google } from 'googleapis';
import Expense from '../models/Expense.js';
import { newOAuthClient } from './google.js';
import { parseEmail } from './parser.js';

const decode = (data = '') => Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const stripHtml = (h) =>
  h.replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

function extractBody(payload) {
  let plain = '', html = '';
  const walk = (p) => {
    if (p.mimeType === 'text/plain' && p.body?.data) plain += decode(p.body.data);
    else if (p.mimeType === 'text/html' && p.body?.data) html += decode(p.body.data);
    p.parts?.forEach(walk);
  };
  walk(payload);
  return plain || stripHtml(html);
}

export async function syncUser(user, { full = false, days = 90 } = {}) {
  const auth = newOAuthClient();
  auth.setCredentials({ refresh_token: user.refreshToken });
  const gmail = google.gmail({ version: 'v1', auth });

  const senders = (process.env.SENDERS || 'easypaisa,telenorbank,nayapay,jazzcash').split(',').map((s) => s.trim());
  // Normal sync: only new mail (1 day overlap). Full rescan: look back `days` days, ignoring lastSyncAt.
  const since =
    user.lastSyncAt && !full
      ? Math.floor(user.lastSyncAt.getTime() / 1000) - 86400
      : Math.floor(Date.now() / 1000) - days * 86400;
  const q = `from:(${senders.join(' OR ')}) after:${since}`;

  // 1. collect message ids
  const ids = [];
  let pageToken;
  do {
    const { data } = await gmail.users.messages.list({ userId: 'me', q, maxResults: 100, pageToken });
    data.messages?.forEach((m) => ids.push(m.id));
    pageToken = data.nextPageToken;
  } while (pageToken);

  // 2. skip ones we already have
  const known = new Set((await Expense.find({ user: user._id, gmailId: { $in: ids } }).select('gmailId')).map((e) => e.gmailId));
  const fresh = ids.filter((id) => !known.has(id));

  // 3. fetch + parse in small batches
  const docs = [];
  const skipped = [];
  for (let i = 0; i < fresh.length; i += 10) {
    const batch = await Promise.all(
      fresh.slice(i, i + 10).map((id) => gmail.users.messages.get({ userId: 'me', id, format: 'full' }))
    );
    for (const { data } of batch) {
      const h = (n) => data.payload.headers.find((x) => x.name.toLowerCase() === n)?.value || '';
      const parsed = parseEmail({ from: h('from'), subject: h('subject'), body: extractBody(data.payload), userName: user.name });
      if (!parsed) skipped.push(h('subject'));
      else
        docs.push({ user: user._id, gmailId: data.id, subject: h('subject'), ...parsed, date: parsed.date || new Date(Number(data.internalDate)) });
    }
  }

  if (docs.length) await Expense.insertMany(docs, { ordered: false }).catch(() => {});
  user.lastSyncAt = new Date();
  await user.save();
  console.log('Skipped emails:', skipped);
  return { matched: ids.length, scanned: fresh.length, added: docs.length, skipped: skipped.slice(0, 5) };
}
