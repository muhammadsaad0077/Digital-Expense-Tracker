import { GlassCard } from './GlassCard';

const Settings = ({ toggleTheme }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl font-bold mb-10">Settings</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <GlassCard title="Theme">
        <button 
          onClick={toggleTheme}
          className="w-full bg-[#2DFFB2] text-black py-4 rounded-2xl font-bold uppercase text-xs hover:scale-[0.98] transition-transform"
        >
          Switch Mode
        </button>
      </GlassCard>
      
      <GlassCard title="Account">
        <div className="flex gap-4">
          <button className="flex-1 bg-white text-black py-4 rounded-2xl font-bold text-xs">Login</button>
          <button className="flex-1 border border-red-500 text-red-500 py-4 rounded-2xl font-bold text-xs hover:bg-red-500/10">Log Out</button>
        </div>
      </GlassCard>
    </div>
  </div>
);

export default Settings;