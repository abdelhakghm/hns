
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
   Video, Sparkles, Play, Download, Loader2, AlertCircle, 
   CloudLightning, ChevronRight, History, Lock, Info 
} from 'lucide-react';
import { db } from '../services/dbService.ts';

const REASSURING_MESSAGES = [
  "Initializing HNS simulation environment...",
  "Calibrating solar radiation parameters...",
  "Simulating fluid dynamics for wind turbine interaction...",
  "Mapping thermodynamic gradients...",
  "Synthesizing visual frames with Veo-3.1...",
  "Refining kinetic energy representations...",
  "Optimizing render for scientific clarity...",
  "Syncing physics engine with academic datasets...",
  "Almost there! Just finalizing the physics pass..."
];

interface VisionGeneratorProps {
  userId: string;
}

const VisionGenerator: React.FC<VisionGeneratorProps> = ({ userId }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    loadHistory();
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        try {
          const has = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(has);
        } catch (e) {
          setHasApiKey(true); // Fallback for standard environments
        }
      } else {
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, [userId]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % REASSURING_MESSAGES.length);
      }, 8000);
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

  const handleOpenSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    if (!process.env.API_KEY) {
      setError("AI Key is missing. Please configure your project credentials.");
      return;
    }
    
    setError(null);
    setGeneratedVideoUrl(null);
    setIsGenerating(true);
    setMessageIndex(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Renewable energy scientific visualization: ${prompt}`,
        config: {
          numberOfVideos: 1,
          aspectRatio: aspectRatio,
          resolution: '720p'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        // Log to DB first for history
        await db.saveVisualization(userId, {
          prompt,
          video_url: downloadLink,
          aspect_ratio: aspectRatio,
          resolution: '720p'
        });

        try {
          // Attempt to fetch with API key appended
          const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
          if (!response.ok) throw new Error("File server access denied.");
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setGeneratedVideoUrl(url);
          loadHistory();
        } catch (fetchErr: any) {
          console.error("Fetch error:", fetchErr);
          // If fetch fails (CORS or network), provide the direct link as fallback if possible
          setError("Render succeeded, but file transfer was blocked by browser security. Check your console for the direct link.");
          setGeneratedVideoUrl(downloadLink + `&key=${process.env.API_KEY}`);
        }
      } else {
        throw new Error("Generation complete but no media was returned.");
      }
    } catch (err: any) {
      console.error("Gemini Video API Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("API key configuration error. Please re-select a valid paid project key.");
      } else {
        setError(err.message || "An unexpected error occurred during rendering.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white rounded-[40px] border border-slate-200 items-center justify-center p-12 text-center">
        <Lock size={48} className="text-amber-500 mb-6" />
        <h2 className="text-2xl font-poppins font-bold text-slate-800">API Key Required</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          Veo-3.1 rendering requires a paid project API key. Please select a valid key from your Google AI Studio account.
        </p>
        <button onClick={handleOpenSelectKey} className="mt-8 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
          Select Paid Project Key <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-poppins font-bold text-slate-800 flex items-center gap-3 justify-center md:justify-start">
            <Video className="text-emerald-600" size={32} />
            HNS Vision Lab
          </h1>
          <p className="text-slate-500 mt-1">Simulate renewable energy phenomena with high-fidelity scientific visuals.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-[10px] font-bold border border-blue-100 shadow-sm">
          <Info size={14} /> POWERED BY VEO 3.1
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Simulation Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A high-detail simulation of wind turbine blade turbulence in 4K style..."
                className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setAspectRatio('16:9')} className={`py-3 rounded-2xl text-xs font-bold border transition-all ${aspectRatio === '16:9' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>16:9 Landscape</button>
                <button onClick={() => setAspectRatio('9:16')} className={`py-3 rounded-2xl text-xs font-bold border transition-all ${aspectRatio === '9:16' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>9:16 Portrait</button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-3">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button 
              disabled={isGenerating || !prompt.trim()}
              onClick={generateVideo}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[28px] shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-95"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              {isGenerating ? 'Rendering Simulation...' : 'Generate Visualization'}
            </button>
          </div>

          {history.length > 0 && (
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <History size={18} />
                <h3 className="font-bold text-sm">Previous Experiments</h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {history.map((item) => (
                  <button key={item.id} onClick={() => setPrompt(item.prompt)} className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 group">
                    <p className="text-[11px] font-bold text-slate-700 truncate">{item.prompt}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 capitalize">{item.aspect_ratio} • {new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-4 rounded-[48px] border border-slate-200 shadow-sm h-full min-h-[450px] flex flex-col overflow-hidden relative">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="relative mb-10">
                  <div className="w-36 h-36 border-4 border-emerald-50 border-t-emerald-500 rounded-full animate-spin shadow-inner"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <CloudLightning size={44} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{REASSURING_MESSAGES[messageIndex]}</h3>
                <p className="text-slate-400 mt-4 text-sm font-medium max-w-xs leading-relaxed">
                  Science takes time. We are crunching complex physics models on the cloud.
                </p>
                <div className="mt-12 w-full max-w-xs h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-emerald-500 animate-progress-loading"></div>
                </div>
              </div>
            ) : generatedVideoUrl ? (
              <div className="flex-1 flex flex-col p-4 animate-in zoom-in-95 duration-700">
                <div className={`relative rounded-[32px] overflow-hidden bg-black shadow-2xl mx-auto border-4 border-white ${aspectRatio === '9:16' ? 'max-w-[280px]' : 'w-full aspect-video'}`}>
                  <video src={generatedVideoUrl} controls className="w-full h-full object-contain" autoPlay loop />
                </div>
                <div className="mt-8 flex items-center justify-between px-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900">Simulation Rendered</h3>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Saved to Cloud Repo</p>
                  </div>
                  <a href={generatedVideoUrl} download="hns_scientific_viz.mp4" className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">
                    <Download size={20} /> Export MP4
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                <div className="p-8 bg-slate-50 rounded-full mb-6 text-slate-300">
                  <Play size={64} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800">Visual Engine Ready</h3>
                <p className="text-slate-500 mt-2 font-medium max-w-sm">Enter a scientific prompt to generate academic visualizations for your projects.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionGenerator;
