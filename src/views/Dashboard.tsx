import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  IndianRupee, 
  AlertTriangle, 
  CheckSquare, 
  ArrowRight, 
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { dbService } from '../services/dbService';

const chartARRData = [
  { name: 'Mon', arrSaved: 45000, actionsApproved: 4 },
  { name: 'Tue', arrSaved: 95000, actionsApproved: 6 },
  { name: 'Wed', arrSaved: 95000, actionsApproved: 8 },
  { name: 'Thu', arrSaved: 195000, actionsApproved: 12 },
  { name: 'Fri', arrSaved: 220000, actionsApproved: 15 },
  { name: 'Sat', arrSaved: 220000, actionsApproved: 16 },
  { name: 'Sun', arrSaved: 275000, actionsApproved: 18 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState<'arr' | 'actions'>('arr');

  // React Query fetchers
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dbService.fetchDashboardMetrics(),
  });

  const { data: interactions, isLoading: loadingInts } = useQuery({
    queryKey: ['recent-interactions'],
    queryFn: () => dbService.fetchInteractions('all'),
  });

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['recent-recommendations'],
    queryFn: () => dbService.fetchRecommendations('all'),
  });

  const isLoading = loadingMetrics || loadingInts || loadingRecs;

  const pendingRecs = recommendations?.filter(r => r.status === 'Pending') || [];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Workspace Overview <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Continuous analysis of your key customer accounts is complete.</p>
        </div>
        <button 
          onClick={() => navigate('/approvals')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <span>Open Approval Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: ARR */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active ARR Managed</p>
            <h3 className="text-2xl font-black text-white mt-1">
              ₹{metrics ? (metrics.totalARR / 1000).toFixed(0) : '0'}k
            </h3>
            <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 block">+12.4% vs last month</span>
          </div>
          <div className="p-3 bg-indigo-950/40 rounded-xl text-indigo-400 border border-indigo-500/20">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Churn Risks */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Churn Risks</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {metrics ? metrics.churnRisksCount : '0'} Accounts
            </h3>
            <span className="text-[10px] font-semibold text-rose-400 mt-0.5 block">Requires immediate action</span>
          </div>
          <div className="p-3 bg-rose-950/40 rounded-xl text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Approval Queue</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {metrics ? metrics.pendingApprovalsCount : '0'} Actions
            </h3>
            <span className="text-[10px] font-semibold text-cyan-400 mt-0.5 block">Waiting for review</span>
          </div>
          <div className="p-3 bg-cyan-950/40 rounded-xl text-cyan-400 border border-cyan-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Action Conversion */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ARR Saved by AI</p>
            <h3 className="text-2xl font-black text-white mt-1">
              ₹{metrics ? (metrics.arrSavedTotal / 1000).toFixed(0) : '0'}k
            </h3>
            <span className="text-[10px] font-semibold text-indigo-400 mt-0.5 block">Via protective playbooks</span>
          </div>
          <div className="p-3 bg-indigo-950/40 rounded-xl text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dynamic Agent Graph pipeline */}
      <WorkflowVisualizer />

      {/* Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg flex flex-col h-96">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Business Impact Analytics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Protecting revenue and streamlining action triggers</p>
            </div>
            
            {/* Chart Tab controls */}
            <div className="flex bg-slate-950 border border-slate-900 p-0.5 rounded-lg">
              <button 
                onClick={() => setChartTab('arr')}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  chartTab === 'arr' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                ARR Saved
              </button>
              <button 
                onClick={() => setChartTab('actions')}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  chartTab === 'actions' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Actions Logged
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartARRData}>
                <defs>
                  <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTab === 'arr' ? '#6366f1' : '#06b6d4'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartTab === 'arr' ? '#6366f1' : '#06b6d4'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(v) => chartTab === 'arr' ? `₹${v / 1000}k` : v}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '8px' }}
                  formatter={(value: any) => [chartTab === 'arr' ? `₹${value.toLocaleString()}` : value, chartTab === 'arr' ? 'ARR Saved' : 'Actions executed']}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartTab === 'arr' ? 'arrSaved' : 'actionsApproved'} 
                  stroke={chartTab === 'arr' ? '#6366f1' : '#06b6d4'} 
                  fillOpacity={1} 
                  fill="url(#colorGlow)" 
                  name={chartTab === 'arr' ? 'ARR Saved' : 'Actions executed'} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini Action Hub */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pending Review Highlights</h3>
            <div className="space-y-4">
              {pendingRecs.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{rec.customer_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold text-[8px] tracking-wide uppercase">{rec.category}</span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1">{rec.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Confidence: {(rec.confidence_score * 100).toFixed(0)}%</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/approvals')}
                    className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => navigate('/recommendations')}
            className="w-full text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 py-2 border border-dashed border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all mt-4"
          >
            View All Recommendations
          </button>
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Customer Interactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Multi-channel communication feed currently parsed by memory pipeline</p>
          </div>
          <button 
            onClick={() => navigate('/interactions')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>View timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {interactions?.slice(0, 3).map(int => (
            <div key={int.id} className="p-4 rounded-xl bg-slate-950/20 border border-slate-900/60 hover:border-slate-800 transition-colors flex items-start gap-4 justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 mt-0.5 shrink-0">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{int.customer_name}</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-[10px] text-slate-400">{int.source} ({int.type})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed bg-slate-950/40 border border-slate-900/50 p-3 rounded-lg">
                    {int.content}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(int.occurred_at).toLocaleTimeString()}</span>
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase shrink-0 ${
                int.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                int.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {int.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
