import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Code } from 'lucide-react';
import { dbService } from '../services/dbService';
import { mockAgents } from '../data/mockData';

export const AIAnalysis: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState('');

  // Fetch customers
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => dbService.fetchCustomers(),
    meta: {
      onSuccess: (data: any) => {
        if (data.length > 0 && !selectedAccount) {
          setSelectedAccount(data[0].id);
        }
      }
    }
  });

  // Automatically initialize first customer ID once loaded
  React.useEffect(() => {
    if (customers && customers.length > 0 && !selectedAccount) {
      setSelectedAccount(customers[0].id);
    }
  }, [customers, selectedAccount]);

  // Fetch agent logs for active customer
  const { data: activeLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['agent-logs', selectedAccount],
    queryFn: () => dbService.fetchAgentLogs(selectedAccount),
    enabled: !!selectedAccount,
  });

  const getLogStatusStyle = (status: string) => {
    switch (status) {
      case 'risk': return 'border-rose-500/20 bg-rose-500/5 text-rose-300';
      case 'opportunity': return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300';
      default: return 'border-slate-800 bg-slate-950/20 text-slate-350';
    }
  };

  const selectedAccountDetails = customers?.find(acc => acc.id === selectedAccount);
  const isLoading = loadingCustomers || (!!selectedAccount && loadingLogs);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Configuration & Selection Panel */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Select Target Account</h3>
          <div className="space-y-2">
            {customers?.map(acc => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccount(acc.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedAccount === acc.id 
                    ? 'border-cyan-500 bg-slate-900/50 shadow-md shadow-cyan-500/5'
                    : 'border-slate-850 hover:border-slate-700 bg-transparent'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{acc.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                    acc.status === 'churn_risk' ? 'bg-rose-500/10 text-rose-400' :
                    acc.status === 'expansion_target' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {acc.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                  <span>ARR: ₹{(acc.arr / 1000).toFixed(0)}k</span>
                  <span>Stage: {acc.stage}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Health / Core Status Cards */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Agent Health</h3>
          <div className="space-y-3">
            {mockAgents.map(agent => (
              <div key={agent.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{agent.message}</p>
                </div>
                <span className="flex h-2.5 w-2.5 shrink-0 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Details Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core Analysis Overview */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Diagnostics: {selectedAccountDetails?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Continuous evaluation metrics calculated by specialized agents</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Risk Threshold</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className={`text-2xl font-black ${selectedAccountDetails?.status === 'churn_risk' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedAccountDetails?.status === 'churn_risk' ? '82%' : '14%'}
                </span>
                <span className="text-[10px] text-slate-500">score</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Calculated by Risk Agent</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Buying Intent</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className={`text-2xl font-black ${selectedAccountDetails?.status === 'expansion_target' ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {selectedAccountDetails?.status === 'expansion_target' ? '91%' : '35%'}
                </span>
                <span className="text-[10px] text-slate-500">level</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Calculated by Opp Agent</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Playbook Alignment</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-black text-cyan-400">94%</span>
                <span className="text-[10px] text-slate-500">fit</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Calculated by Action Agent</p>
            </div>
          </div>
        </div>

        {/* Execution Traces / Logs */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Pipeline Execution Trace <Code className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-405 text-slate-400 mt-0.5">Chronological system execution logs for the current session run</p>
            </div>
            
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-agent-run', { detail: { accountId: selectedAccount } }))}
              className="bg-indigo-650/15 hover:bg-indigo-600 text-indigo-455 hover:text-white border border-indigo-500/25 hover:border-transparent font-semibold text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Retrace Execution</span>
            </button>
          </div>

          <div className="space-y-4">
            {!activeLogs || activeLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active execution traces found for this account.
              </div>
            ) : (
              activeLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 ${getLogStatusStyle(log.status || 'success')}`}
                >
                  <div className="p-1.5 bg-slate-950/60 rounded border border-slate-900 text-[10px] font-bold text-cyan-400 font-mono">
                    {log.timestamp}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none mb-1">{log.agent_name}</h5>
                    <p className="text-[11px] font-medium leading-relaxed">{log.thought}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
