import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckSquare, 
  ThumbsDown, 
  Edit3, 
  Send, 
  X, 
  Cpu, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { ThinkingTimeline } from '../components/ThinkingTimeline';
import { dbService } from '../services/dbService';

export const HumanApproval: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRecId, setSelectedRecId] = useState<string>('');
  
  // Edit states for Workspace
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('Incorrect context');
  
  // Feedback banners
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Load recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => dbService.fetchRecommendations(),
  });

  const pendingRecs = React.useMemo(() => {
    return recommendations?.filter(r => r.status === 'Pending') || [];
  }, [recommendations]);

  const selectedRec = pendingRecs.find(r => r.id === selectedRecId) || pendingRecs[0];

  // Auto select first pending recommendation once loaded
  React.useEffect(() => {
    if (pendingRecs.length > 0 && !selectedRecId) {
      setSelectedRecId(pendingRecs[0].id);
    }
  }, [pendingRecs, selectedRecId]);

  // Sync edits when selected item changes
  React.useEffect(() => {
    if (selectedRec) {
      setEditBody(selectedRec.payload.body || '');
      setEditSubject(selectedRec.payload.subject || '');
      setShowRejectForm(false);
    }
  }, [selectedRecId, selectedRec]);

  // Load explanation logs for thinking timeline in Workspace
  const { data: explanationLogs } = useQuery({
    queryKey: ['agent-logs-workspace', selectedRec?.customer_id],
    queryFn: () => dbService.fetchAgentLogs(selectedRec!.customer_id),
    enabled: !!selectedRec,
  });

  // Mutator for submitting approvals
  const approvalMutation = useMutation({
    mutationFn: ({ 
      recId, 
      action, 
      notes, 
      reason 
    }: { 
      recId: string; 
      action: 'Approved' | 'Rejected'; 
      notes?: string; 
      reason?: string 
    }) => {
      return dbService.submitApproval(recId, action, notes, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      
      // Auto select next pending recommendation in list
      const remainingPending = pendingRecs.filter(r => r.id !== variables.recId);
      if (remainingPending.length > 0) {
        setSelectedRecId(remainingPending[0].id);
      } else {
        setSelectedRecId('');
      }

      setFeedbackMsg({
        type: variables.action === 'Approved' ? 'success' : 'info',
        text: variables.action === 'Approved' 
          ? `Action approved and executed! Outreach email dispatched via GSuite API. Rep feedback loop logged to vector store.`
          : `Action dismissed. Reason logged: "${variables.reason}". Context vectorized to prevent similar recommendations in future.`
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  });

  const handleApprove = () => {
    if (!selectedRec) return;
    approvalMutation.mutate({
      recId: selectedRec.id,
      action: 'Approved',
      notes: editBody
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRec) return;
    approvalMutation.mutate({
      recId: selectedRec.id,
      action: 'Rejected',
      reason: rejectReason
    });
    setShowRejectForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Human Approval Workspace <CheckSquare className="w-6 h-6 text-emerald-400" />
        </h1>
        <p className="text-slate-455 text-xs mt-0.5">Review, refine, and execute AI-generated communications and workflows</p>
      </div>

      {/* Notifications / Banner updates */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300' 
            : 'bg-indigo-950/20 border-indigo-500/25 text-indigo-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs font-semibold leading-normal">
            {feedbackMsg.text}
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-0.5 hover:bg-slate-900 rounded shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Pending List */}
        <div className="p-5 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-4 self-start">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Pending Review Queue ({pendingRecs.length})</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Actions requiring human sign-off before API dispatch</p>
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {pendingRecs.length === 0 ? (
              <div className="p-8 text-center text-slate-550 text-xs border border-dashed border-slate-800 rounded-xl">
                No actions currently waiting for approval.
              </div>
            ) : (
              pendingRecs.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecId(rec.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedRec?.id === rec.id 
                      ? 'border-indigo-500 bg-slate-900/50 shadow-md shadow-indigo-500/5'
                      : 'border-slate-850 hover:border-slate-700 bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{rec.customer_name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold text-[8px] tracking-wide uppercase">{rec.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{rec.title}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-2">
                    <span className="font-semibold text-emerald-400">{(rec.confidence_score * 100).toFixed(0)}% Match</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRec ? (
            <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-6">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{selectedRec.customer_name}</span>
                  <h2 className="text-base font-bold text-white mt-1">{selectedRec.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#0d1b3e] border border-cyan-500/20 text-xs text-cyan-400 font-bold uppercase tracking-wide">
                    {selectedRec.category}
                  </span>
                </div>
              </div>

              {/* Explainable Reasoning */}
              <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/10 space-y-2 text-slate-405 text-slate-400 text-[11px] leading-relaxed">
                <span className="font-bold text-slate-350 uppercase tracking-wider text-[8px] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Agent Recommendation Rationale
                </span>
                <p>{selectedRec.reasoning}</p>
              </div>

              {/* Action Form Workspace */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-400" /> Outreach Payload Editor
                </h3>

                {selectedRec.payload.channel === 'email' && (
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject line</label>
                    <input 
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Message Body</label>
                  <textarea 
                    rows={8}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Workspace CTA Controls */}
              <div className="pt-4 border-t border-[#1e293b] flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={approvalMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Approve & Dispatch</span>
                  </button>

                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    disabled={approvalMutation.isPending}
                    className="bg-slate-900 hover:bg-slate-850 border border-[#1e293b] text-rose-400 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-medium">Recipient: {selectedRec.payload.recipient}</span>
              </div>

              {/* Reject dropdown popup */}
              {showRejectForm && (
                <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-4 animate-slideDown">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rejection feedback reason</label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-rose-500/50 cursor-pointer"
                    >
                      <option value="Incorrect context">Incorrect customer context</option>
                      <option value="Bad timing">Poor conversational timing</option>
                      <option value="Competitor threat misidentified">Competitor threat misidentified</option>
                      <option value="Pricing discount too high">Pricing discount too aggressive</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>Confirm Dismissal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Explainable AI logs */}
              {explanationLogs && explanationLogs.length > 0 && (
                <div className="pt-6 border-t border-[#1e293b]">
                  <ThinkingTimeline steps={explanationLogs.map(l => ({
                    id: l.id,
                    agent: l.agent_name,
                    thought: l.thought,
                    toolCall: l.tool_call,
                    observation: l.observation,
                    status: l.status,
                    timestamp: l.timestamp
                  }))} />
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg text-center text-slate-500 text-xs">
              Select a pending action from the queue to start review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
