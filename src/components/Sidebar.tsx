import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BrainCircuit, 
  Compass, 
  Database, 
  CheckSquare, 
  Settings as SettingsIcon, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Interactions', path: '/interactions', icon: MessageSquare },
  { name: 'AI Analysis', path: '/analysis', icon: BrainCircuit },
  { name: 'Recommendations', path: '/recommendations', icon: Compass },
  { name: 'Shared Memory', path: '/memory', icon: Database },
  { name: 'Human Approval', path: '/approvals', icon: CheckSquare },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear mock auth if any
    localStorage.removeItem('dp_auth');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#070b19] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-none">DecisionPilot</h1>
          <span className="text-[10px] text-cyan-400 tracking-wider uppercase font-semibold">Enterprise AI</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/10 border-l-2 border-cyan-400 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 z-10 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span className="z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-[#1e293b] bg-slate-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Alice Roberts</p>
            <p className="text-xs text-slate-500 truncate">Account Executive</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
