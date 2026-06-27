import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive page title from route
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const mockNotifications = [
    { id: '1', title: 'New Risk Recommendation', body: 'Snowflake Inc. renewal threatened by budget freeze. High priority action drafted.', type: 'risk' },
    { id: '2', title: 'Stripe Seat Expansion', body: 'Agent discovered Dave requested a seat upgrade volume quote.', type: 'upsell' },
  ];

  return (
    <header className="h-16 bg-[#070b19]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-8 sticky top-0 z-10 w-[calc(100%-16rem)] ml-64">
      {/* Page Title & Status */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight">{getPageTitle()}</h2>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span>Sync Active</span>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-6">
        {/* Mock Search */}
        <div className="relative w-64 hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input 
            type="text" 
            placeholder="Search accounts, memory..." 
            className="w-full bg-[#0d1527] border border-[#1e293b] rounded-lg py-1.5 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* AI Orchestrator Monitor */}
        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
          <Cpu className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          <div className="text-[11px] leading-tight">
            <p className="text-slate-300 font-medium">Agent Engine</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Listening</p>
          </div>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-700 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0b1329] border border-[#1e293b] rounded-xl shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1e293b]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Agent Notifications</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-semibold">2 New</span>
              </div>
              <div className="space-y-3">
                {mockNotifications.map(notification => (
                  <div key={notification.id} className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-900/50 transition-colors">
                    {notification.type === 'risk' ? (
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h5 className="text-xs font-semibold text-white">{notification.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{notification.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
