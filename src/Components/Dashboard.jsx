import { GlassCard } from './GlassCard';

const Dashboard = () => (
  <div className="animate-in fade-in duration-500">
    <h1 className="text-4xl font-light mb-10">Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <GlassCard title="Gmail Status">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#2DFFB2] rounded-full animate-pulse"></div>
          <span className="text-xl font-bold">Live Syncing</span>
        </div>
      </GlassCard>
      <GlassCard title="Today's Transactions">
        <h2 className="text-3xl font-bold">12 Detected</h2>
      </GlassCard>
      <GlassCard title="SQL DB Status">
        <h2 className="text-xl font-bold text-[#2DFFB2]">Connected</h2>
      </GlassCard>
    </div>
    <GlassCard className="mt-8">
      <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
      <div className="flex gap-4">
        <button className="bg-[#2DFFB2] text-black px-8 py-4 rounded-2xl font-bold text-xs hover:opacity-80 transition-all">RE-SCAN GMAIL</button>
        <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all">EXPORT DATABASE</button>
      </div>
    </GlassCard>
  </div>
);

export default Dashboard;