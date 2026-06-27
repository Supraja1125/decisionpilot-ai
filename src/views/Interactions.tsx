import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Sparkles, 
  Filter, 
  Search, 
  Calendar, 
  Layers
} from 'lucide-react';
import { dbService } from '../services/dbService';

export const Interactions: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form state for adding interaction
  const [newContent, setNewContent] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newSource, setNewSource] = useState<'Gmail' | 'Zoom' | 'Salesforce' | 'Slack'>('Gmail');
  const [newType, setNewType] = useState<'Email' | 'Call' | 'MeetingNote' | 'CRM_Update'>('Email');

  // Load active customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => dbService.fetchCustomers(),
    meta: {
      onSuccess: (data: any) => {
        if (data.length > 0 && !newAccount) {
          setNewAccount(data[0].id);
        }
      }
    }
  });

  // Automatically initialize first customer ID once loaded
  React.useEffect(() => {
    if (customers && customers.length > 0 && !newAccount) {
      setNewAccount(customers[0].id);
    }
  }, [customers]);

  // Load interactions
  const { data: interactions, isLoading } = useQuery({
    queryKey: ['interactions', filterAccount],
    queryFn: () => dbService.fetchInteractions(filterAccount),
  });

  // Mutator for adding interaction
  const createIntMutation = useMutation({
    mutationFn: ({ content, customerId, source, type }: { content: string; customerId: string; source: any; type: any }) => {
      return dbService.createInteraction(content, customerId, source, type);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setNewContent('');
      
      // Trigger global live agent pipeline runner modal overlay
      window.dispatchEvent(new CustomEvent('trigger-agent-run', { detail: { accountId: data.customer_id } }));
    }
  });

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newAccount) return;
    createIntMutation.mutate({
      content: newContent,
      customerId: newAccount,
      source: newSource,
      type: newType
    });
  };

  // Filtered list
  const filteredInteractions = (interactions || []).filter(int => {
    const matchesSource = filterSource === 'all' || int.source === filterSource;
    const matchesSearch = int.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (int.customer_name && int.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSource && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Interaction List & Filter */}
      <div className="lg:col-span-2 space-y-6">
        {/* Filters */}
        <div className="p-4 rounded-xl bg-[#070b19] border border-[#1e293b] flex flex-wrap gap-4 items-center justify-between shadow">
          <div className="flex flex-wrap items-center gap-3">
            {/* Account filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <select 
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 pl-9 pr-6 text-xs text-slate-355 text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
              >
                <option value="all">All Accounts</option>
                {customers?.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Source filter */}
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="Gmail">Gmail</option>
              <option value="Zoom">Zoom</option>
              <option value="Salesforce">Salesforce</option>
              <option value="Slack">Slack</option>
            </select>
          </div>

          {/* Text Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-3.5 h-3.5 text-slate-550 text-slate-500" />
            </span>
            <input 
              type="text" 
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-350 placeholder-slate-550 focus:outline-none focus:border-cyan-500/50 transition-all text-white"
            />
          </div>
        </div>

        {/* Interaction Feed */}
        <div className="space-y-4">
          {filteredInteractions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              No matching customer interactions found.
            </div>
          ) : (
            filteredInteractions.map(int => (
              <div 
                key={int.id}
                className="p-5 rounded-2xl bg-[#070b19] border border-[#1e293b] hover:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#0d1527] border border-[#1e293b] rounded-xl text-cyan-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="text-sm font-bold text-white leading-none">{int.customer_name}</h4>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold uppercase">{int.source}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold uppercase">{int.type}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-3 font-medium leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                      {int.content}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(int.occurred_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-3 self-end sm:self-start w-full sm:w-auto justify-between sm:justify-start">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase ${
                    int.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                    int.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {int.sentiment}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg self-start space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Ingestion Simulator <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-450 mt-1">Simulate multi-channel data push. Submitting routes raw text through the pipeline state machine.</p>
        </div>

        <form onSubmit={handleAddInteraction} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Account</label>
            <select 
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {customers?.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Channel</label>
              <select 
                value={newSource}
                onChange={(e: any) => setNewSource(e.target.value)}
                className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="Gmail">Gmail</option>
                <option value="Zoom">Zoom</option>
                <option value="Salesforce">Salesforce</option>
                <option value="Slack">Slack</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
              <select 
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="Email">Email</option>
                <option value="Call">Call</option>
                <option value="MeetingNote">Meeting Note</option>
                <option value="CRM_Update">CRM Log</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Communication Content</label>
            <textarea 
              rows={4}
              required
              placeholder="Paste email text, Zoom transcription details, or client complaints here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-sans leading-relaxed"
            />
          </div>

          <button 
            type="submit"
            disabled={createIntMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs disabled:opacity-50"
          >
            {createIntMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Agent DAG...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Ingest & Trigger Planner</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
