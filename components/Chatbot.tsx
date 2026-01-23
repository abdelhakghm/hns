
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyAdvice } from '../services/geminiService.ts';
import { Send, User as UserIcon, Bot, Sparkles, Loader2, Info, AlertTriangle, ExternalLink, Settings } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your HNS Academic Assistant. How can I help you with your renewable energy studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isApiKeyMissing) {
      scrollToBottom();
    }
  }, [messages, isApiKeyMissing]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isApiKeyMissing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await generateStudyAdvice(userMessage);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sorry, I missed that.' }]);
    setIsLoading(false);
  };

  if (isApiKeyMissing) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 animate-pulse">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-poppins font-bold text-slate-800">AI Configuration Required</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          The HNS Assistant uses Google Gemini to provide academic support. To enable this feature, the administrator needs to add the API Key to the environment variables.
        </p>
        
        <div className="mt-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-left w-full max-w-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Settings size={14} />
            Setup Instructions
          </h3>
          <ol className="space-y-3">
            <li className="flex gap-3 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">AI Studio <ExternalLink size={12} /></a></span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Go to Vercel Project Settings</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Add <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded text-emerald-700 font-mono">API_KEY</code> variable</span>
            </li>
          </ol>
        </div>

        <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Rest of the app remains fully functional
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-lg leading-none">HNS Assistant</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              <span className="text-xs text-emerald-100 font-medium">Powered by Gemini AI</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <Info size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-slate-200'
              }`}>
                {msg.role === 'user' ? <UserIcon size={20} /> : <Sparkles size={20} />}
              </div>
              <div className={`p-4 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white text-emerald-600 border border-slate-200">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about PV systems, exam tips, or study schedules..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
