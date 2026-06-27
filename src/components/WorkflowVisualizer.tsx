import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Cpu, 
  Database, 
  FileText, 
  ShieldAlert, 
  Compass, 
  CheckSquare, 
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle,
  Activity
} from 'lucide-react';

interface AgentNodeProps {
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  isActive: boolean;
}

const AgentNode: React.FC<AgentNodeProps> = ({ name, role, icon: Icon, status, isActive }) => {
  const getStatusBorder = () => {
    if (isActive && status === 'running') return 'border-cyan-500 shadow-lg shadow-cyan-500/20 text-cyan-400 bg-slate-900/80';
    if (status === 'completed') return 'border-indigo-500/50 shadow shadow-indigo-500/10 text-indigo-400 bg-slate-900/60';
    if (status === 'failed') return 'border-rose-500/50 text-rose-400 bg-rose-950/20';
    return 'border-slate-800 text-slate-500 bg-slate-950/20';
  };

  return (
    <div className={`relative p-3 rounded-xl border flex items-center gap-3 w-48 shadow-md transition-all duration-300 ${getStatusBorder()}`}>
      {isActive && status === 'running' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
      )}
      
      <div className={`p-2 rounded-lg transition-colors ${status === 'running' ? 'bg-cyan-950 text-cyan-400' : status === 'completed' ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-900'}`}>
        <Icon className={`w-4 h-4 ${status === 'running' ? 'animate-pulse' : ''}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-bold text-white truncate leading-tight">{name}</h4>
        <p className="text-[9px] text-slate-400 truncate mt-0.5">{role}</p>
      </div>
    </div>
  );
};

export const WorkflowVisualizer: React.FC = () => {
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [thinkingLogs, setThinkingLogs] = useState<string[]>([]);

  const agents = [
    { id: 0, name: 'Planner Agent', role: 'Workflow Dispatcher', icon: Cpu },
    { id: 1, name: 'Context Retrieval', role: 'pgvector Searcher', icon: Database },
    { id: 2, name: 'Meeting Analysis', role: 'Transcript Parser', icon: FileText },
    { id: 3, name: 'Risk Analysis', role: 'Churn Classifier', icon: ShieldAlert },
    { id: 4, name: 'Recommendation', role: 'Playbook Mapper', icon: Compass },
    { id: 5, name: 'Memory Agent', role: 'Embedding Refiner', icon: Activity },
    { id: 6, name: 'Human Approval', role: 'Sign-off Manager', icon: CheckSquare }
  ];

  const logs = [
    'Planner: Ingestion detected. Parsing meeting transcript and routing flow...',
    'Context: Searching vector store for Stripe pricing agreements...',
    'Meeting: Extracted keyword tokens. Found "doubling team next quarter"...',
    'Risk: Checked competitor flags. Risk tier low. Churn threat 14%.',
    'Recommendation: Applied Enterprise Volume Discount Playbook. Created email draft.',
    'Memory: Generated tone embeddings and updated historic episodic logs.',
    'Approval: Recommendation queued for review. Notification dispatched to AE.'
  ];

  useEffect(() => {
    let interval: any;
    if (simState === 'running') {
      interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= 6) {
            setSimState('completed');
            clearInterval(interval);
            return prev;
          }
          const next = prev + 1;
          setThinkingLogs(l => [...l, logs[next]]);
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [simState]);

  const handleStartSim = () => {
    setThinkingLogs([logs[0]]);
    setActiveStep(0);
    setSimState('running');
  };

  const handleReset = () => {
    setActiveStep(-1);
    setThinkingLogs([]);
    setSimState('idle');
  };

  return (
    <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Multi-Agent Pipeline Graph <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Sequential state machine trace illustrating multi-agent collaborative execution loops</p>
        </div>

        <div className="flex items-center gap-3">
          {simState === 'idle' ? (
            <button
              onClick={handleStartSim}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow shadow-indigo-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Run</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Graph</span>
            </button>
          )}

          {simState === 'running' && (
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              <span>Running...</span>
            </div>
          )}
          {simState === 'completed' && (
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Finished</span>
            </div>
          )}
        </div>
      </div>

      {/* DAG Node Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 py-2 overflow-x-auto">
        {agents.map((agent, idx) => {
          let status: 'idle' | 'running' | 'completed' | 'failed' = 'idle';
          if (simState === 'completed') status = 'completed';
          else if (simState === 'running') {
            if (activeStep > idx) status = 'completed';
            else if (activeStep === idx) status = 'running';
          }
          
          return (
            <div key={agent.id} className="flex items-center gap-2">
              <AgentNode 
                name={agent.name}
                role={agent.role}
                icon={agent.icon}
                status={status}
                isActive={activeStep === idx}
              />
              {idx < 6 && (
                <ArrowRight className="w-4 h-4 text-slate-800 hidden lg:block shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time thinking log output */}
      <AnimatePresence>
        {thinkingLogs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2 font-mono text-[10px] text-slate-400 overflow-hidden"
          >
            <span className="text-slate-500 font-bold block uppercase text-[8px] tracking-widest flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Pipeline Console Stream
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
              {thinkingLogs.map((log, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-1"
                >
                  <span className="text-cyan-500">➜</span>
                  <span className={index === thinkingLogs.length - 1 ? 'text-white font-semibold' : ''}>{log}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
