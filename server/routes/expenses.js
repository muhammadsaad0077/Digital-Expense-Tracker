import { Router } from 'express';
import Expense from '../models/Expense.js';
import { requireAuth } from '../middleware/auth.js';
import { syncUser } from '../services/gmailSync.js';

const router = Router();
router.use(requireAuth);

// Dates arrive as YYYY-MM-DD and are read in Pakistan time (UTC+5)
const TZ = 'Asia/Karachi';
function buildMatch(req) {
  const { from, to, provider } = req.query;
  const match = { user: req.user._id };
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(`${from}T00:00:00+05:00`);
    if (to) match.date.$lte = new Date(`${to}T23:59:59.999+05:00`);
  }
  if (provider && provider !== 'all') match.provider = provider;
  return match;
}

router.get('/', async (req, res) => {
  res.json(await Expense.find(buildMatch(req)).sort({ date: -1 }).limit(1000));
});

// Totals + chart series. groupBy = day | week | month
router.get('/summary', async (req, res) => {
  const unit = ['day', 'week', 'month'].includes(req.query.groupBy) ? req.query.groupBy : 'day';
  const match = buildMatch(req);
  const [series, byProvider, totals] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { $dateTrunc: { date: '$date', unit, timezone: TZ, startOfWeek: 'monday' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Expense.aggregate([{ $match: match }, { $group: { _id: '$provider', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    Expense.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, max: { $max: '$amount' } } }]),
  ]);
  res.json({ series, byProvider, total: totals[0]?.total || 0, count: totals[0]?.count || 0, max: totals[0]?.max || 0 });
});

router.post('/sync', async (req, res, next) => {
  try {
    if (!req.user.refreshToken) return res.status(400).json({ message: 'Please sign in with Google again to grant Gmail access.' });
    res.json(await syncUser(req.user, { full: req.query.full === '1', days: Number(req.query.days) || 90 }));
  } catch (e) {
    if (e.code === 403 || e.message?.includes('Insufficient Permission'))
      return res.status(403).json({ message: 'Gmail access was not granted. Sign out, sign in again and tick "Read your email messages".' });
    if (e.message?.includes('invalid_grant')) return res.status(401).json({ message: 'Gmail access expired. Sign out and sign in again.' });
    next(e);
  }
});

router.delete('/:id', async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
