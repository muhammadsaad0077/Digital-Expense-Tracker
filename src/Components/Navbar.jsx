import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';

const Navbar = ({ isLight }) => {
  const navItems = ['dashboard', 'analytics', 'transactions', 'settings'];

  return (
    <header className="flex justify-between items-center mb-16">
      <NavLink to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-[#2DFFB2] p-1.5 rounded-lg text-black group-hover:rotate-12 transition-transform">
          <ArrowUpRight size={20} />
        </div>
        <span className="text-xl font-bold tracking-tighter">Finverge</span>
      </NavLink>

      <div className={`flex gap-1 p-1 rounded-full border ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} backdrop-blur-md`}>
        {navItems.map((item) => (
          <NavLink
            key={item}
            to={`/${item}`}
            className={({ isActive }) => `
              px-5 py-2 text-[0.75rem] font-bold rounded-full transition-all 
              ${isActive 
                ? (isLight ? 'bg-black text-white' : 'bg-white text-black') 
                : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <Search className="text-gray-500 w-5 h-5 cursor-pointer" />
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-full border border-white/10 bg-gray-800" alt="profile" />
      </div>
    </header>
  );
};

export default Navbar;