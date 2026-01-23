
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
   Video, 
   Sparkles, 
   Play, 
   Download, 
   Loader2, 
   AlertCircle, 
   CloudLightning,
   ChevronRight,
   History,
   Lock
} from 'lucide-react';
import { db } from '../services/dbService.ts';

interface VisionGeneratorProps {
  userId: string;
}

const VisionGenerator: React.FC<VisionGeneratorProps> = ({ userId }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    loadHistory();
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, [userId]);

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
    
    setError(null);
    setGeneratedVideoUrl(null);
    setIsGenerating(true);
    setStatusMessage('Connecting to HNS Vision core...');

    try {
      // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the current API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatusMessage('Analyzing scientific prompt...');
      // Fix: Follow guidelines for veo-3.1-fast-generate-preview and include resolution
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Renewable energy scientific visualization: ${prompt}`,
        config: {
          numberOfVideos: 1,
          aspectRatio: aspectRatio,
          resolution: '720p'
        }
      });

      setStatusMessage('Simulating physics...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        setStatusMessage('Syncing with Neon Cloud...');
        await db.saveVisualization(userId, {
          prompt,
          video_url: downloadLink,
          aspect_ratio: aspectRatio,
          resolution: '720p'
        });

        // Use the API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedVideoUrl(url);
        loadHistory();
      } else {
        throw new Error("Generation complete but no media was returned.");
      }
    } catch (err: any) {
      console.error("Gemini Video API Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("Your API key project was not found. Please re-select a valid paid API key.");
      } else {
        setError(err.message || "An unexpected error occurred during rendering.");
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white rounded-[40px] border border-slate-200 items-center justify-center p-12 text-center">
        <Lock size={48} className="text-amber-500 mb-6" />
        <h2 className="text-2xl font-poppins font-bold text-slate-800">API Key Required</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          The Veo Video Generator requires a paid API key from Google AI Studio. 
          Please ensure your selected project has billing enabled.
        </p>
        <button 
          onClick={handleOpenSelectKey}
          className="mt-8 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          Select Paid Project Key
          <ChevronRight size={18} />
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 text-xs text-emerald-600 font-bold hover:underline"
        >
          Learn about Billing Setup
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-poppins font-bold text-slate-800 flex items-center gap-3 justify-center md:justify-start">
            <Video className="text-emerald-600" size={32} />
            HNS Vision Lab
          </h1>
          <p className="text-slate-500 mt-1">Generate high-fidelity scientific visualizations using Veo 3.1.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Visualization Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A simulation of a solar farm in the Sahara with sand filtration systems..."
                className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Aspect Ratio</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-3 animate-in shake duration-500">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button 
              disabled={isGenerating || !prompt.trim()}
              onClick={generateVideo}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[28px] shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
              {isGenerating ? 'Rendering...' : 'Start Rendering'}
            </button>
          </div>

          {history.length > 0 && (
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <History size={18} />
                <h3 className="font-bold">Recent Simulations</h3>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {history.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setPrompt(item.prompt)}
                    className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-700 truncate">{item.prompt}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-4 rounded-[48px] border border-slate-200 shadow-sm h-full min-h-[400px] flex flex-col overflow-hidden">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <CloudLightning size={32} className="animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800">{statusMessage}</p>
                <p className="text-xs text-slate-400 font-medium px-12 text-center">Video generation can take up to 2 minutes. Please remain on this screen.</p>
              </div>
            ) : generatedVideoUrl ? (
              <div className="flex-1 flex flex-col p-4 animate-in fade-in">
                <div className={`relative rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl mx-auto ${aspectRatio === '9:16' ? 'max-w-[280px]' : 'w-full aspect-video'}`}>
                  <video src={generatedVideoUrl} controls className="w-full h-full object-cover" autoPlay loop />
                </div>
                <div className="mt-8 flex items-center justify-between px-2">
                  <div>
                    <h3 className="font-bold text-slate-800">Simulation Complete</h3>
                    <p className="text-xs text-slate-400">Result saved to your HNS cloud profile.</p>
                  </div>
                  <a href={generatedVideoUrl} download="hns_viz.mp4" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    <Download size={18} /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                <Play size={40} className="mb-6 text-slate-300" />
                <h3 className="text-2xl font-bold text-slate-800">Vision Console</h3>
                <p className="text-slate-400 mt-2 font-medium">Ready for scientific simulation input.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionGenerator;
