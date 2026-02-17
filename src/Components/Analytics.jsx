import { Line } from 'react-chartjs-2';
import { GlassCard } from './GlassCard';

const Analytics = ({ mode, setMode, chartData }) => {
  if(!chartData || !chartData.datasets) {
    return <div className="text-white">Loading chart...</div>;
  }
  return(
  <div className="animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-end mb-10">
      <h1 className="text-4xl font-light">Welcome back, <span className="font-bold">Catherine</span></h1>
      <div className="flex bg-white/5 p-1 rounded-xl mt-6 md:mt-0 border border-white/5">
        {['today', 'week', 'month'].map((m) => (
          <button 
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2 text-[0.7rem] font-bold transition-all ${mode === m ? 'bg-[#1f1f1f] text-white rounded-full shadow-lg' : 'text-gray-500'}`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <GlassCard className="lg:col-span-4" title="Total Spend">
        <h2 className="text-5xl font-black text-[#2DFFB2] tracking-tighter">
          {mode === 'today' ? '$145.00' : '$4,565.00'}
        </h2>
      </GlassCard>
      <GlassCard className="lg:col-span-8 h-[350px]">
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { display: false } } }} />
      </GlassCard>
    </div>
  </div>
  );
};

export default Analytics;