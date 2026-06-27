import React, { useState } from 'react';
import { 
  Save, 
  Cpu, 
  Database, 
  Sliders, 
  Sparkles
} from 'lucide-react';

export const Settings: React.FC = () => {
  // Mock Settings state
  const [llmModel, setLlmModel] = useState('claude-3-5-sonnet');
  const [temperature, setTemperature] = useState(0.2);
  const [crmConnected, setCrmConnected] = useState(true);
  const [toneMode, setToneMode] = useState('technical');
  const [maxTokens, setMaxTokens] = useState(1500);

  // Form submit state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Settings Sections */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core Agent LLM Configurations */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" /> AI Agent Core Models
            </h3>
            <p className="text-xs text-slate-450 mt-1">Select and configure LLM engines driving the next best action pipeline</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Reasoning Model</label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended - Optimized for reasoning)</option>
                <option value="gemini-1-5-pro">Gemini 1.5 Pro (Optimized for long meeting transcripts)</option>
                <option value="gpt-4o">GPT-4o (Standard latency-optimized)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Temperature ({temperature})</label>
                <input 
                  type="range" 
                  min="0.0" 
                  max="1.0" 
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Max Tokens Output</label>
                <input 
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integration Hub */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> B2B CRM Integrations
            </h3>
            <p className="text-xs text-slate-450 mt-1">Manage api hooks sync channels and database configurations</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#ea4335]/15 flex items-center justify-center font-black text-rose-450 text-xs">SF</div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">Salesforce CRM Integration</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Sync opportunities, stage updates, and representative notes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCrmConnected(!crmConnected)}
                className={`text-[10px] font-bold py-1.5 px-3.5 rounded-lg border transition-all ${
                  crmConnected 
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/25'
                    : 'border-[#1e293b] bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {crmConnected ? 'Connected' : 'Connect'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#ff7a59]/15 flex items-center justify-center font-black text-orange-450 text-xs">HS</div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">HubSpot CRM Integration</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Inbound webhooks for contacts and activities</p>
                </div>
              </div>
              <button
                type="button"
                className="text-[10px] font-bold py-1.5 px-3.5 rounded-lg border border-[#1e293b] bg-slate-900 text-slate-400 hover:text-white"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar settings config */}
      <div className="space-y-6 self-start">
        {/* Playbook prompt tuning */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" /> Playbook Tone Tuning
            </h3>
            <p className="text-xs text-slate-450 mt-1">Configure outreach generator parameters</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Communication Style</label>
              <select
                value={toneMode}
                onChange={(e) => setToneMode(e.target.value)}
                className="w-full bg-[#0b1329] border border-[#1e293b] rounded-lg py-2 px-3 text-xs text-slate-350 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="technical">Technical & Detailed (Recommended for Developers/CTOs)</option>
                <option value="executive">Executive & ROI-focused (Recommended for CFOs/VP Sales)</option>
                <option value="conversational">Friendly & Relationship-driven (Recommended for Account Success)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/10 text-[10px] text-slate-450 leading-normal flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <span>Tone configuration alters the copywriter agent prompt templates dynamically before generating messages.</span>
            </div>
          </div>
        </div>

        {/* Global Save Controls */}
        <div className="p-6 rounded-2xl bg-[#070b19] border border-[#1e293b] shadow-lg space-y-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-xs"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
          
          {saveSuccess && (
            <p className="text-emerald-400 text-xs font-semibold text-center animate-pulse">
              Configurations saved successfully!
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
