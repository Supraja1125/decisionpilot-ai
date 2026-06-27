import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  ArrowRight, 
  Search, 
  Cpu, 
  CheckCircle2, 
  XCircle,
  FileText,
  Bookmark,
  TrendingUp,
  X
} from 'lucide-react';
import { dbService } from '../services/dbService';
import type { Recommendation } from '../services/dbService';
import { ThinkingTimeline } from '../components/ThinkingTimeline';

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Explanation Modal state
  const [activeRecExplanation, setActiveRecExplanation] = useState<Recommendation | null>(null);

  // Load recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', filterCategory],
    queryFn: () => dbService.fetchRecommendations(filterCategory),
  });

  // Load explanation logs dynamically when modal is opened
  const { data: explanationLogs } = useQuery({
    queryKey: ['agent-logs-explanation', activeRecExplanation?.customer_id],
    queryFn: () => dbService.fetchAgentLogs(activeRecExplanation!.customer_id),
    enabled: !!activeRecExplanation,
  });

  // Filter logic
  const filteredRecs = (recommendations || []).filter(rec => {
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesSearch = (rec.customer_name && rec.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Executed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Approved': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Recommended Actions Feed <Compass className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-slate-450 text-xs mt-0.5">Strategic Next Best Actions mapped directly to accounts and opportunities</p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#070b19] border border-[#1e293b] flex flex-wrap gap-4 items-center justify-between shadow">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Risk Mitigation">Risk Mitigation</option>
            <option value="Upsell">Upsell</option>
            <option value="Relationship">Relationship</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Executed">Executed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Text Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-500" />
          </span>
          <input 
            type="text" 
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-355 placeholder-slate-550 focus:outline-none focus:border-cyan-500/50 transition-all text-white"
          />
        </div>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecs.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            No recommendations match your query.
          </div>
        ) : (
          filteredRecs.map(rec => (
            <div 
              key={rec.id}
              className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] hover:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Card Header info */}
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.customer_name}</span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">{rec.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wide shrink-0 ${getStatusStyle(rec.status)}`}>
                    {rec.status}
                  </span>
                </div>

                {/* Category & Confidence Badge */}
                <div className="flex items-center gap-2 mt-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-[9px] uppercase tracking-wide">
                    {rec.category}
                  </span>
                  
                  {/* Gauge style Confidence Score */}
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-850 flex items-center gap-1.5 text-[9px] font-semibold text-slate-350">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Confidence:</span>
                    <span className="text-cyan-300 font-bold">{(rec.confidence_score * 100).toFixed(0)}%</span>
                  </span>
                </div>

                {/* Action Summary */}
                <p className="text-xs text-slate-300 mt-4 leading-relaxed font-medium">
                  {rec.summary}
                </p>

                {/* Evidence Snippet Preview */}
                {rec.evidence && rec.evidence.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/20 border border-slate-900 space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-3 h-3 text-cyan-455" /> Supporting Evidence
                    </span>
                    <ul className="list-disc pl-3 text-[10px] text-slate-400 space-y-1 leading-relaxed">
                      {rec.evidence.map((ev, i) => (
                        <li key={i} className="truncate">{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between">
                <button
                  onClick={() => setActiveRecExplanation(rec)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors hover:underline"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Explain Recommendation</span>
                </button>
                
                {rec.status === 'Pending' ? (
                  <button
                    onClick={() => navigate('/approvals')}
                    className="bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all border border-indigo-500/20 hover:border-transparent"
                  >
                    <span>Open Review Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-550">
                    {rec.status === 'Executed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {rec.status === 'Rejected' && <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>Action {rec.status.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Explainable AI Modal Overlay */}
      {activeRecExplanation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#070b19] border border-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6 relative animate-zoomIn">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-[#1e293b]">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{activeRecExplanation.customer_name}</span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">{activeRecExplanation.title}</h3>
              </div>
              <button 
                onClick={() => setActiveRecExplanation(null)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Confidence & Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Decision Match</span>
                <span className="text-lg font-black text-cyan-400 mt-1 block">{(activeRecExplanation.confidence_score * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Playbook ID</span>
                <span className="text-xs font-mono font-bold text-indigo-400 mt-1.5 block">PB-91</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Extract Source</span>
                <span className="text-xs font-bold text-white mt-1.5 block">Multi-channel</span>
              </div>
            </div>

            {/* Detailed summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-400" /> Strategic Actions summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/20 p-3.5 rounded-xl border border-slate-900">
                {activeRecExplanation.summary}
              </p>
            </div>

            {/* Injected Thinking steps */}
            {explanationLogs ? (
              <ThinkingTimeline steps={explanationLogs.map(l => ({
                id: l.id,
                agent: l.agent_name,
                thought: l.thought,
                toolCall: l.tool_call,
                observation: l.observation,
                status: l.status,
                timestamp: l.timestamp
              }))} />
            ) : (
              <div className="text-center text-xs text-slate-500 py-4">
                Loading Agent trace logs...
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
              <button 
                onClick={() => setActiveRecExplanation(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
              >
                Close Explanation
              </button>
              {activeRecExplanation.status === 'Pending' && (
                <button 
                  onClick={() => {
                    setActiveRecExplanation(null);
                    navigate('/approvals');
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-xs font-semibold text-white transition-colors"
                >
                  Go to Approvals Workspace
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
