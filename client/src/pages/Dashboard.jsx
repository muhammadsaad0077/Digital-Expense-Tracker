import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api';

const fmt = (n) => `Rs ${Math.round(n).toLocaleString('en-PK')}`;
const D = 'YYYY-MM-DD';
const PROVIDER_COLOR = { Easypaisa: '#1E9E5A', NayaPay: '#6B4FD8', JazzCash: '#D33A2C', SadaPay: '#E0A100' };

function presetRange(key) {
  const today = dayjs();
  switch (key) {
    case 'today': return { from: today.format(D), to: today.format(D) };
    case 'week': return { from: today.subtract((today.day() + 6) % 7, 'day').format(D), to: today.format(D) }; // Monday start
    case 'month': return { from: today.startOf('month').format(D), to: today.format(D) };
    case '3months': return { from: today.subtract(3, 'month').startOf('month').format(D), to: today.format(D) };
    default: return null;
  }
}

const PRESETS = [
  ['today', 'Today'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['3months', 'Last 3 months'],
  ['custom', 'Custom range'],
];

export default function Dashboard({ user, onLogout, onUser }) {
  const [preset, setPreset] = useState('month');
  const [range, setRange] = useState(presetRange('month'));
  const [groupBy, setGroupBy] = useState('day');
  const [provider, setProvider] = useState('all');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ series: [], byProvider: [], total: 0, count: 0, max: 0 });
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  const params = useMemo(() => ({ ...range, provider }), [range, provider]);

  const load = useCallback(async () => {
    const [list, sum] = await Promise.all([
      api.get('/expenses', { params }),
      api.get('/expenses/summary', { params: { ...params, groupBy } }),
    ]);
    setItems(list.data);
    setSummary(sum.data);
  }, [params, groupBy]);

  useEffect(() => { load(); }, [load]);

  const sync = useCallback(async (full = false) => {
    setSyncing(true);
    setMsg('');
    try {
      const { data } = await api.post('/expenses/sync', null, { params: full ? { full: 1, days: 90 } : {} });
      const skipped = data.skipped?.length ? ` Not recognised as payments: ${data.skipped.join('; ')}` : '';
      setMsg(`Gmail returned ${data.matched} email${data.matched === 1 ? '' : 's'}; added ${data.added} new payment${data.added === 1 ? '' : 's'}.${skipped}`);
      await load();
      onUser((await api.get('/auth/me')).data);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Sync failed. Try again.');
    } finally {
      setSyncing(false);
    }
  }, [load, onUser]);

  // First visit: pull emails automatically
  useEffect(() => { if (!user.lastSyncAt) sync(false); }, []); // eslint-disable-line

  const choosePreset = (key) => {
    setPreset(key);
    const r = presetRange(key);
    if (r) setRange(r);
    if (key === '3months') setGroupBy('week');
    else if (key !== 'custom') setGroupBy('day');
  };

  const label = (iso) => {
    const d = dayjs(iso);
    return groupBy === 'month' ? d.format('MMM YYYY') : groupBy === 'week' ? `Wk ${d.format('D MMM')}` : d.format('D MMM');
  };
  const chartData = summary.series.map((s) => ({ name: label(s._id), total: s.total }));

  const remove = async (id) => { await api.delete(`/expenses/${id}`); load(); };
  const logout = async () => { await api.post('/auth/logout'); onLogout(); };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-ink/60 sm:inline">{user.email}</span>
          <button onClick={() => sync(false)} disabled={syncing} className="rounded-lg bg-moss px-4 py-2 font-semibold text-white hover:bg-ink disabled:opacity-60">
            {syncing ? 'Checking Gmail…' : 'Sync Gmail'}
          </button>
          <button onClick={() => sync(true)} disabled={syncing} className="rounded-lg border border-ink/20 px-3 py-2 hover:bg-mist disabled:opacity-60">
            Rescan 90 days
          </button>
          <button onClick={logout} className="rounded-lg border border-ink/20 px-3 py-2 hover:bg-mist">Sign out</button>
        </div>
      </header>
      {msg && <p role="status" className="mt-3 text-sm text-moss">{msg}</p>}

      <section className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-mist p-1" role="group" aria-label="Period">
          {PRESETS.map(([k, l]) => (
            <button key={k} onClick={() => choosePreset(k)} aria-pressed={preset === k}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${preset === k ? 'bg-ink text-paper' : 'hover:bg-white/60'}`}>
              {l}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex items-center gap-2 text-sm">
            <input type="date" aria-label="From date" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} className="rounded-lg border border-ink/20 bg-white px-2 py-1.5" />
            <span>to</span>
            <input type="date" aria-label="To date" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} className="rounded-lg border border-ink/20 bg-white px-2 py-1.5" />
          </div>
        )}
        <select aria-label="Wallet" value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm">
          <option value="all">All wallets</option>
          {Object.keys(PROVIDER_COLOR).map((p) => <option key={p}>{p}</option>)}
        </select>
      </section>

      <section className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm text-ink/60">
            Spent {range.from === range.to ? dayjs(range.from).format('D MMM YYYY') : `${dayjs(range.from).format('D MMM')} to ${dayjs(range.to).format('D MMM YYYY')}`}
          </p>
          <p className="font-display text-6xl font-bold tracking-tight sm:text-7xl">{fmt(summary.total)}</p>
          <p className="mt-1 text-ink/70">
            across {summary.count} payment{summary.count === 1 ? '' : 's'}
            {summary.count > 0 && `, largest ${fmt(summary.max)}`}
          </p>
        </div>
        <ul className="flex gap-5 text-sm">
          {summary.byProvider.map((p) => (
            <li key={p._id}>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: PROVIDER_COLOR[p._id] || '#555' }} />
              {p._id}
              <div className="font-semibold">{fmt(p.total)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Spending over time</h2>
          <div className="flex gap-1 rounded-lg bg-mist p-1 text-sm" role="group" aria-label="Group by">
            {['day', 'week', 'month'].map((g) => (
              <button key={g} onClick={() => setGroupBy(g)} aria-pressed={groupBy === g}
                className={`rounded-md px-3 py-1 capitalize ${groupBy === g ? 'bg-ink text-paper' : 'hover:bg-white/60'}`}>{g}</button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="py-16 text-center text-ink/60">Nothing in this period. Try a wider range or press Sync Gmail.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#DCE3DE" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={55} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip formatter={(v) => fmt(v)} cursor={{ fill: '#EEF1EE' }} />
                <Bar dataKey="total" fill="#0E6B4F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">All expenses</h2>
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-mist text-ink/60">
              <tr><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Wallet</th><th className="p-3 font-medium">Paid to</th><th className="p-3 text-right font-medium">Amount</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e._id} className="border-b border-mist/70 last:border-0">
                  <td className="whitespace-nowrap p-3">{dayjs(e.date).format('D MMM, h:mm A')}</td>
                  <td className="p-3"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR[e.provider] || '#555' }} />{e.provider}</td>
                  <td className="p-3 text-ink/80">{e.merchant || <span className="text-ink/40" title={e.subject}>{e.subject?.slice(0, 40) || '-'}</span>}</td>
                  <td className="p-3 text-right font-semibold">{fmt(e.amount)}</td>
                  <td className="p-3 text-right"><button onClick={() => remove(e._id)} aria-label="Remove expense" className="text-ink/40 hover:text-clay">Remove</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-ink/60">No expenses to show.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
