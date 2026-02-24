
import React, { useState, useEffect } from 'react';
import { 
   FileText, Sparkles, Play, Download, Loader2, AlertCircle, 
   CloudLightning, ChevronRight, History, Info, BookOpen 
} from 'lucide-react';
import { db } from '../services/dbService.ts';
import { generateLiquidResponse } from '../services/geminiService.ts';

const REASSURING_MESSAGES = [
  "Initializing HNS simulation environment...",
  "Calibrating solar radiation parameters...",
  "Simulating fluid dynamics for wind turbine interaction...",
  "Mapping thermodynamic gradients...",
  "Synthesizing scientific data with HNS Core...",
  "Refining kinetic energy representations...",
  "Optimizing results for academic clarity...",
  "Syncing physics engine with academic datasets...",
  "Finalizing simulation report pass..."
];

interface VisionGeneratorProps {
  userId: string;
}

const VisionGenerator: React.FC<VisionGeneratorProps> = ({ userId }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % REASSURING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const loadHistory = async () => {
    try {
      const data = await db.getVisualizations(userId);
      setHistory(data);
    } catch (e) {
      console.error("Failed to load viz history:", e);
    }
  };

  const generateSimulation = async () => {
    if (!prompt.trim()) return;
    
    setError(null);
    setSimulationReport(null);
    setIsGenerating(true);
    setMessageIndex(0);

    try {
      const result = await generateLiquidResponse(`Generate a detailed scientific simulation report for: ${prompt}. Include technical parameters, estimated yield, and thermodynamic analysis.`);
      
      if (result.text) {
        setSimulationReport(result.text);
        
        // Persist to database as a visualization record (using URL field for data string in this context)
        await db.saveVisualization(userId, {
          prompt,
          video_url: "SIM_REPORT_TEXT", // Marker for text-based reports
          aspect_ratio: "TEXT",
          resolution: 'HNS-Core'
        });
        loadHistory();
      } else {
        throw new Error("Simulation engine returned an empty result.");
      }
    } catch (err: any) {
      console.error("HNS AI Simulation Error:", err);
      setError(err.message || "An unexpected error occurred during the physics pass.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-poppins font-bold text-slate-100 flex items-center gap-3 justify-center md:justify-start">
            <BookOpen className="text-emerald-500" size={32} />
            HNS Simulation Lab
          </h1>
          <p className="text-slate-500 mt-1">Simulate renewable energy phenomena with the HNS Hub Intelligence Core.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[10px] font-bold border border-emerald-500/20 shadow-sm">
          <Info size={14} /> POWERED BY GEMINI 3 PRO
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-8 rounded-[40px] border border-white/5 shadow-sm space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Simulation Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a phenomenon: e.g., Blade turbulence in high-velocity wind..."
                className="w-full h-32 p-5 bg-slate-900/50 border border-white/10 rounded-3xl text-sm font-medium text-white outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-start gap-3">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button 
              disabled={isGenerating || !prompt.trim()}
              onClick={generateSimulation}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[28px] shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-95"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              {isGenerating ? 'Synthesizing Physics...' : 'Run Simulation'}
            </button>
          </div>

          {history.length > 0 && (
            <div className="glass-card p-6 rounded-[32px] border border-white/5">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <History size={18} />
                <h3 className="font-bold text-sm uppercase tracking-widest">Simulation Archive</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {history.map((item) => (
                  <button key={item.id} onClick={() => setPrompt(item.prompt)} className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 group">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{item.prompt}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 capitalize">HNS Core • {new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="glass-card p-4 rounded-[48px] border border-white/5 shadow-sm h-full min-h-[450px] flex flex-col overflow-hidden relative">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="relative mb-10">
                  <div className="w-36 h-36 border-4 border-emerald-500/5 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <CloudLightning size={44} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{REASSURING_MESSAGES[messageIndex]}</h3>
                <div className="mt-12 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            ) : simulationReport ? (
              <div className="flex-1 flex flex-col p-8 animate-in zoom-in-95 duration-700 bg-slate-950/40 rounded-[36px] overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed text-slate-300">
                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Simulation Report</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Generated by HNS Hub Intelligence</p>
                  </div>
                  <div className="p-3 bg-emerald-600 rounded-xl text-white">
                    <FileText size={20} />
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{simulationReport}</div>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end">
                   <button className="flex items-center gap-2 bg-white/5 text-emerald-400 px-6 py-3 rounded-xl font-bold hover:bg-emerald-500/10 transition-all text-[10px] uppercase tracking-widest border border-emerald-500/20">
                    <Download size={14} /> Export Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                <div className="p-8 bg-slate-900 rounded-full mb-6 text-slate-700 border border-white/5">
                  <Play size={64} />
                </div>
                <h3 className="text-3xl font-bold text-white">Simulation Node Ready</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm">Enter a scientific prompt to synthesize academic reports for your research.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionGenerator;
