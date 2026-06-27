import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Terminal, 
  Database
} from 'lucide-react';
import type { ThinkingStep } from '../data/mockData';

interface ThinkingTimelineProps {
  steps: ThinkingStep[];
}

export const ThinkingTimeline: React.FC<ThinkingTimelineProps> = ({ steps }) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedStepId === id) setExpandedStepId(null);
    else setExpandedStepId(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" /> Agent Thinking Timeline
        </h4>
        <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-450 border border-cyan-500/20 font-mono">
          ReAct Chain-of-Thought
        </span>
      </div>

      <div className="relative border-l border-slate-800 ml-3.5 pl-6 space-y-6 py-2">
        {steps.map((step) => {
          const isExpanded = expandedStepId === step.id;
          const hasDetails = !!(step.toolCall || step.observation);

          return (
            <div key={step.id} className="relative">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border bg-[#020617] border-indigo-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              </div>

              {/* Step Card */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:border-slate-800 transition-all space-y-2">
                <div 
                  className="flex justify-between items-start gap-4 cursor-pointer"
                  onClick={() => hasDetails && toggleExpand(step.id)}
                >
                  <div>
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">{step.agent}</span>
                    <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">{step.thought}</p>
                  </div>
                  
                  {hasDetails && (
                    <button className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-white transition-colors self-start">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Collapsible Tool Call Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-2.5 space-y-2.5"
                    >
                      {step.toolCall && (
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-indigo-400" /> Tool Invocation
                          </span>
                          <div className="p-2.5 rounded-lg bg-[#070b19] border border-slate-900 text-[10px] font-mono text-cyan-300 overflow-x-auto leading-normal">
                            {step.toolCall}
                          </div>
                        </div>
                      )}

                      {step.observation && (
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Database className="w-3 h-3 text-cyan-450" /> Observation Output
                          </span>
                          <div className="p-2.5 rounded-lg bg-[#070b19] border border-slate-900 text-[10px] font-mono text-slate-350 leading-relaxed">
                            {step.observation}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
