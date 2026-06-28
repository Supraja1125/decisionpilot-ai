import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Database, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Compass, 
  Activity, 
  CheckSquare,
  CheckCircle,
  Zap
} from 'lucide-react';

interface LiveAgentExecutionModalProps {
  isOpen: boolean;
  accountId: string;
  onComplete: () => void;
}

interface Step {
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  details: string[];
}

const steps: Step[] = [
    {
      name: 'Planner Agent',
      role: 'Orchestrating flow routing parameters',
      icon: Cpu,
      details: ['Ingesting raw customer touchpoints...', 'Analyzing communication source and intent...', 'Routing task paths to specialized sub-agents.']
    },
    {
      name: 'Context Retrieval Agent',
      role: 'pgvector memory context query loader',
      icon: Database,
      details: ['Searching previous account interactions...', 'Searching historical rep feedback vectors...', 'Retrieving B2B playbooks relative to intent.']
    },
    {
      name: 'Meeting Analysis Agent',
      role: 'Transcript semantic entity extractor',
      icon: FileText,
      details: ['Parsing conversational topics & phrases...', 'Detecting buyer sentiment signals...', 'Evaluating priority levels and urgency factors.']
    },
    {
      name: 'Risk Analysis Agent',
      role: 'Account churn threat classifier',
      icon: ShieldAlert,
      details: ['Calculating churn probability matrices...', 'Identifying decision-maker departures...', 'Flagging budget freeze statements.']
    },
    {
      name: 'Opportunity Agent',
      role: 'Buying signal expansion classifier',
      icon: TrendingUp,
      details: ['Detecting upsell and cross-sell triggers...', 'Analyzing department hiring growth vectors...', 'Mapping active proposal timelines.']
    },
    {
      name: 'Recommendation Agent',
      role: 'Next Best Action formulator',
      icon: Compass,
      details: ['Synthesizing risk flags with buying intent...', 'Selecting optimal sales playbook template...', 'Structuring raw email outreach body.']
    },
    {
      name: 'Memory Agent',
      role: 'Vector embedding update synchronizer',
      icon: Activity,
      details: ['Generating tone vectors for outreach text...', 'Syncing new interaction facts to pgvector...', 'Recalculating account context weights.']
    },
    {
      name: 'Human Approval Queue',
      role: 'AE review sign-off registrar',
      icon: CheckSquare,
      details: ['Formatting action card parameters...', 'Pushing recommendation to AE queue...', 'Triggering workspace notification event.']
    }
  ];

export const LiveAgentExecutionModal: React.FC<LiveAgentExecutionModalProps> = ({ isOpen, accountId, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [pipelineProgress, setPipelineProgress] = useState(0);

  // Target confidence based on account selection
  const targetConfidence = accountId === '2' ? 98 : accountId === '3' ? 82 : 94;

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setConfidence(0);
      setPipelineProgress(0);
      return;
    }

    // Step traversal timer loop
    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          // End execution, call complete after slight delay
          setTimeout(() => {
            onComplete();
          }, 1500);
          return prev;
        }
        const next = prev + 1;
        setPipelineProgress((next / steps.length) * 100);
        return next;
      });
    }, 1800);

    return () => clearInterval(stepInterval);
  }, [isOpen, onComplete]);

  // Confidence increment timer loop (starts at step 5)
  useEffect(() => {
    if (!isOpen || activeStep < 5) return;

    const target = targetConfidence;
    const incrementInterval = setInterval(() => {
      setConfidence(prev => {
        if (prev >= target) {
          clearInterval(incrementInterval);
          return target;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(incrementInterval);
  }, [isOpen, activeStep, targetConfidence]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#070b19] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
        
        {/* Left Side: Pipeline Summary & Progress */}
        <div className="w-full md:w-80 bg-slate-950/45 p-6 border-r border-[#1e293b] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center shadow shadow-indigo-600/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider leading-none">DecisionPilot AI</h2>
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5 block">Pipeline Monitor</span>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Pipeline Sync</span>
                <span>{Math.round(pipelineProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  animate={{ width: `${pipelineProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Confidence Score Display */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-850 text-center space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Agent Decision Match</span>
              <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
                {confidence}%
              </div>
              <span className="text-[9px] font-semibold text-slate-450 block leading-tight">Confidence rating dynamically builds during execution</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-550 leading-normal flex items-start gap-1.5 p-3 rounded-lg bg-indigo-950/10 border border-indigo-500/10">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>AI Platform matches communication patterns against B2B sales playbooks and indexes rep corrections to pgvector memory.</span>
          </div>
        </div>

        {/* Right Side: Agents Execution Timeline */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Collaborative Agent Grid</h3>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" /> Synchronizing Nodes
              </span>
            </div>

            {/* Vertical timeline steps */}
            <div className="relative border-l border-slate-850 ml-3.5 pl-6 space-y-6">
              {steps.map((step, idx) => {
                let status: 'idle' | 'running' | 'completed' = 'idle';
                if (activeStep > idx) status = 'completed';
                else if (activeStep === idx) status = 'running';

                return (
                  <div key={idx} className="relative">
                    {/* Node status bullet */}
                    <div className={`absolute -left-[32px] top-1.5 w-4 h-4 rounded-full border bg-[#070b19] flex items-center justify-center transition-all ${
                      status === 'completed' 
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                        : status === 'running' 
                        ? 'border-cyan-400 text-cyan-400 animate-pulse' 
                        : 'border-slate-800 text-slate-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                      )}
                    </div>

                    {/* Step Card info */}
                    <div className={`p-3.5 rounded-xl border transition-all ${
                      status === 'running' 
                        ? 'border-cyan-500 bg-slate-900/40 shadow shadow-cyan-500/5' 
                        : status === 'completed' 
                        ? 'border-slate-900 bg-slate-950/10 opacity-75' 
                        : 'border-transparent opacity-40'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded bg-slate-900 text-slate-400 ${status === 'running' ? 'text-cyan-400' : status === 'completed' ? 'text-indigo-400' : ''}`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{step.name}</h4>
                          <p className="text-[10px] text-slate-450 mt-0.5">{step.role}</p>
                        </div>
                      </div>

                      {/* Log details list for active running step */}
                      <AnimatePresence>
                        {status === 'running' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pl-8 space-y-1 text-[10px] text-slate-400 font-mono overflow-hidden"
                          >
                            {step.details.map((detail, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-1.5">
                                <span className="text-cyan-500">➜</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
