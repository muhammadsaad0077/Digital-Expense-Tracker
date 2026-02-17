export const GlassCard = ({ title, children, className = "" }) => (
  <div className={`glass-card p-8 rounded-[32px] border border-white/10 bg-white/5 transition-all hover:-translate-y-2 hover:border-[#2DFFB2]/40 hover:shadow-2xl ${className}`}>
    {title && <p className="text-gray-500 text-xs font-bold uppercase mb-2">{title}</p>}
    {children}
  </div>
);