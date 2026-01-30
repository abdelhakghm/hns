
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyAdvice } from '../services/geminiService.ts';
import { db } from '../services/dbService.ts';
import { User } from '../types';
import { 
  Send, Bot, Loader2, Zap, 
  Cpu, Terminal, Command, Fingerprint, Waves, Activity, ChevronRight
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps { user: User; }

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadChatHistory(); }, [user.id]);

  const loadChatHistory = async () => {
    try {
      const history = await db.getChatHistory(user.id);
      if (history.length > 0) {
        setMessages(history as Message[]);
      } else {
        setMessages([{ 
          role: 'assistant', 
          content: "Neural link established. I am the **HNS Liquid Core**, optimized for Renewable Energy research and academic optimization. \n\nHow can I calibrate your study path today?" 
        }]);
      }
    } catch (e) { console.error(e); } finally { setIsInitialLoading(false); }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await db.saveChatMessage(user.id, 'user', userMessage);
    
    setIsLoading(true);
    try {
      const result = await generateStudyAdvice(userMessage);
      const assistantMsg: Message = { role: 'assistant', content: result.text };
      setMessages(prev => [...prev, assistantMsg]);
      await db.saveChatMessage(user.id, 'assistant', result.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const NEURAL_PRESETS = [
    { label: "Solar Math", prompt: "Explain the mathematics of photovoltaic efficiency." },
    { label: "Turbine Physics", prompt: "Explain Betz's Law in wind turbines." },
    { label: "Grid Storage", prompt: "Compare lithium-ion vs pumped hydro for grid storage." },
    { label: "TP Help", prompt: "Help me write a conclusion for a Lab TP on thermal solar collectors." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-8rem)] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-950/20 rounded-[40px] border border-white/5 overflow-hidden">
      
      {/* Tactical Header - Compact on Mobile */}
      <div className="glass-card border-b border-white/5 p-4 md:p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Cpu size={20} className="text-emerald-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <h2 className="font-poppins font-bold text-sm md:text-lg text-white leading-tight">Neural Core</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Activity size={10} className="text-emerald-500" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Link v3.2</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
           <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sync Stable</span>
           </div>
        </div>
      </div>

      {/* Terminal Main Stream - The Scrollable Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-slate-950/40"
      >
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 animate-pulse">
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Connecting to HNS Core...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500`}
              >
                <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center border text-xs ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                      : 'bg-slate-900 border-white/10 text-emerald-400'
                  }`}>
                    {msg.role === 'user' ? <Fingerprint size={16} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`space-y-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest px-1">
                      <span>{msg.role === 'user' ? user.name : 'System'}</span>
                    </div>
                    
                    <div className={`p-4 md:p-5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600/20 text-white rounded-tr-none border border-emerald-500/20' 
                        : 'bg-slate-900/80 text-slate-100 border border-white/5 rounded-tl-none font-mono selection:bg-emerald-500/30'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Generating Output</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>

      {/* Control Deck */}
      <div className="bg-slate-950/60 border-t border-white/5 p-4 md:p-6 shrink-0">
        {/* Horizontal Scrolling Presets on Mobile */}
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2 no-scrollbar">
          {NEURAL_PRESETS.map((preset) => (
            <button 
              key={preset.label}
              onClick={() => { setInput(preset.prompt); }}
              className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-emerald-600/10 border border-white/5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-2 shrink-0 group active:scale-95"
            >
              <Zap size={10} className="text-emerald-500" />
              {preset.label}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="relative">
          <div className="flex gap-3 items-center bg-slate-900 border border-white/10 rounded-2xl p-1.5 pl-4 transition-all focus-within:border-emerald-500/50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject command..."
              className="flex-1 bg-transparent py-3 outline-none font-medium text-white text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:grayscale active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        <div className="mt-3 flex items-center justify-between opacity-30">
           <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">HNS Secured Neural Tunnel</span>
           <div className="flex gap-1">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-1 h-1 bg-emerald-500 rounded-full"></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
