import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Database, 
  Search, 
  HelpCircle, 
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { dbService } from '../services/dbService';

export const Memory: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'embeddings' | 'timeline'>('embeddings');
  const [selectedAccountTimeline, setSelectedAccountTimeline] = useState('');

  // Vector embeddings list states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Input states for mock adding embedding
  const [newInsight, setNewInsight] = useState('');
  const [newAccount, setNewAccount] = useState('none');
  const [newCategory, setNewCategory] = useState<'Account Fact' | 'Sales Playbook' | 'Rep Feedback'>('Account Fact');

  // Load customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => dbService.fetchCustomers(),
  });

  // Automatically initialize first customer ID once loaded for timeline selector
  React.useEffect(() => {
    if (customers && customers.length > 0 && !selectedAccountTimeline) {
      setSelectedAccountTimeline(customers[0].id);
    }
  }, [customers, selectedAccountTimeline]);

  // Load shared memories
  const { data: embeddings, isLoading: loadingEmbeddings } = useQuery({
    queryKey: ['memory-embeddings'],
    queryFn: () => dbService.fetchMemoryEmbeddings(),
  });

  // Load memory timeline
  const { data: timelineItems, isLoading: loadingTimeline } = useQuery({
    queryKey: ['memory-timeline', selectedAccountTimeline],
    queryFn: () => dbService.fetchMemoryTimeline(selectedAccountTimeline),
    enabled: !!selectedAccountTimeline && activeTab === 'timeline',
  });

  // Mutator for adding memory
  const addMemoryMutation = useMutation({
    mutationFn: ({ insight, category, customerId }: { insight: string; category: any; customerId: string | null }) => {
      return dbService.createMemory(insight, category, customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-embeddings'] });
      setNewInsight('');
    }
  });

  const handleAddInsight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.trim()) return;

    addMemoryMutation.mutate({
      insight: newInsight,
      category: newCategory,
      customerId: newAccount === 'none' ? null : newAccount
    });
  };

  // Filter list
  const filteredEmbeddings = (embeddings || []).filter(emb => {
    const matchesCategory = filterCategory === 'all' || emb.category === filterCategory;
    const matchesSearch = emb.insight.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (emb.customer_name && emb.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const isLoading = loadingEmbeddings || (activeTab === 'timeline' && loadingTimeline);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Switcher */}
      <div className="flex justify-between items-center pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Shared Memory Workspace <Database className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-slate-450 text-xs mt-0.5">Explore cognitive vector stores and historical fact extraction pipelines</p>
        </div>

        <div className="flex bg-[#0b1329] border border-[#1e293b] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('embeddings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'embeddings' 
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector Memory Index
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timeline' 
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Memory Timeline
          </button>
        </div>
      </div>

      {activeTab === 'embeddings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Memory Database Table view */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search / Filter header */}
            <div className="p-4 rounded-xl bg-[#070b19] border border-[#1e293b] flex flex-wrap gap-4 items-center justify-between shadow">
              <div className="flex items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 px-3 text-xs text-slate-355 text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="all">All Memory Types</option>
                  <option value="Account Fact">Account Facts</option>
                  <option value="Sales Playbook">Sales Playbooks</option>
                  <option value="Rep Feedback">Rep Feedback Loops</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-slate-505 text-slate-500" />
                </span>
                <input 
                  type="text" 
                  placeholder="Query semantic memory (pgvector)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-350 placeholder-slate-550 focus:outline-none focus:border-cyan-500/50 transition-all text-white"
                />
              </div>
            </div>

            {/* Vector DB entries list */}
            <div className="space-y-4">
              {filteredEmbeddings.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No vector embeddings matches found.
                </div>
              ) : (
                filteredEmbeddings.map(emb => (
                  <div 
                    key={emb.id}
                    className="p-5 rounded-2xl bg-[#070b19] border border-[#1e293b] hover:border-slate-800 shadow-md hover:shadow-lg transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 mt-0.5 shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold uppercase">{emb.category}</span>
                          <span className="text-slate-650 text-slate-600 text-xs">•</span>
                          <span className="text-[10px] text-slate-450 font-bold">{emb.customer_name}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2.5 font-medium leading-relaxed bg-slate-950/20 p-3.5 rounded-lg border border-slate-900 font-mono">
                          {emb.insight}
                        </p>
                        <span className="text-[9px] text-slate-500 mt-2.5 block">Embedding stored: {emb.created_at ? new Date(emb.created_at).toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simulator for writing to Vector database */}
          <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg self-start space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Vector DB Write Console <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-455 mt-1">Inject custom business facts or rep guidance rule sets into pgvector memory.</p>
            </div>

            <form onSubmit={handleAddInsight} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Context scope</label>
                <select
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="none">Global Sales Rules</option>
                  {customers?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Memory Type</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="Account Fact">Account Fact</option>
                  <option value="Sales Playbook">Sales Playbook</option>
                  <option value="Rep Feedback">Rep Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Knowledge Rule / Insight Text</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. When dealing with Stripe, always mention custom webhook limits since engineering is highly sensitive to API rates."
                  value={newInsight}
                  onChange={(e) => setNewInsight(e.target.value)}
                  className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-all font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={addMemoryMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs disabled:opacity-50"
              >
                {addMemoryMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Vectorizing Embedding...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Calculate & Store Embedding</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/10 text-[10px] text-slate-450 leading-normal flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>Calculated embeddings represent points in semantic high-dimensional space. The search bar uses mock Cosine Similarity on active vectors.</span>
            </div>
          </div>
        </div>
      ) : (
        /* AI Memory Timeline tab view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline Account Selector */}
          <div className="p-5 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-4 self-start">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Select Account</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Filter the memory extraction log timeline by client account</p>
            </div>

            <div className="space-y-2">
              {customers?.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountTimeline(acc.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedAccountTimeline === acc.id 
                      ? 'border-indigo-500 bg-slate-900/50 shadow-md shadow-indigo-500/5'
                      : 'border-slate-850 hover:border-slate-700 bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{acc.name}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">{acc.industry}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chronological Memory Timeline list */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg">
            <div className="pb-4 border-b border-[#1e293b] mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fact Extraction History</h3>
              <p className="text-xs text-slate-450 mt-0.5">Auditable history of insights mapped to database files by Memory Agent</p>
            </div>

            <div className="relative border-l border-slate-800 ml-4 pl-8 space-y-8 py-2">
              {!timelineItems || timelineItems.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6">
                  No memory logs found for this account.
                </div>
              ) : (
                timelineItems.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Time Node */}
                    <div className="absolute -left-[41px] top-1 bg-[#020617] border border-cyan-400 w-5 h-5 rounded-full flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-semibold uppercase">{item.type}</span>
                        <span className="text-[10px] text-slate-500">{new Date(item.occurredAt).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        {item.description}
                      </p>

                      {/* Fact extracted block */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/10 border border-indigo-500/10 space-y-1.5">
                        <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Extracted Fact to Long-term Memory
                        </span>
                        <p className="text-xs text-slate-300 font-mono italic">
                          "{item.factExtracted}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
