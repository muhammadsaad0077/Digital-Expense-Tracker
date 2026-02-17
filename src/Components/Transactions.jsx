import { ShoppingCart, PlayCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';

const Transactions = () => {
  const data = [
    { n: "Amazon Pay", e: "order@amazon.com", v: "-$120", i: <ShoppingCart /> },
    { n: "Netflix", e: "info@netflix.com", v: "-$15", i: <PlayCircle /> }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-bold mb-10">Transaction History</h1>
      <GlassCard>
        {data.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl mb-4 last:mb-0 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#2DFFB2]">
                {item.i}
              </div>
              <div>
                <p className="font-bold">{item.n}</p>
                <p className="text-[10px] text-gray-500 uppercase">{item.e}</p>
              </div>
            </div>
            <span className="font-black text-lg">{item.v}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

export default Transactions;