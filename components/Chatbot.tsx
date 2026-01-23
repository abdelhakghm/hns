
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyAdvice } from '../services/geminiService.ts';
import { db } from '../services/dbService.ts';
import { User } from '../types';
import { Send, Bot, Sparkles, Loader2, User as UserIcon } from 'lucide-react';

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

  useEffect(() => { loadChatHistory(); }, [user.id]);

  const loadChatHistory = async () => {
    try {
      const history = await db.getChatHistory(user.id);
      if (history.length > 0) {
        setMessages(history as Message[]);
      } else {
        setMessages([{ role: 'assistant', content: 'Neural systems online. Welcome to the HNS academic core. How can I assist your renewable energy research today?' }]);
      }
    } catch (e) { console.error(e); } finally { setIsInitialLoading(false); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await db.saveChatMessage(user.id, 'user', userMessage);
    
    setIsLoading(true);
    const result = await generateStudyAdvice(userMessage);
    const assistantMsg: Message = { role: 'assistant', content: result.text };
    setMessages(prev => [...prev, assistantMsg]);
    await db.saveChatMessage(user.id, 'assistant', result.text);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-4xl mx-auto bg-white rounded-[56px] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-slate-900 p-10 flex items-center justify-between text-white animate-shimmer">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500 rounded-3xl shadow-xl shadow-emerald-500/20 animate-float"><Bot size={28} /></div>
          <div>
            <h2 className="font-poppins font-bold text-2xl leading-none">HNS Neural Core</h2>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Synchronized & Ready
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/20 custom-scrollbar">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-6">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] animate-pulse">Mapping Knowledge Clusters...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in zoom-in-95 duration-500 ease-out`}>
                <div className={`flex gap-5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-slate-100'
                  }`}>
                    {msg.role === 'user' ? <UserIcon size={24} /> : <Sparkles size={24} />}
                  </div>
                  <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-emerald-600 border border-slate-100 shadow-lg">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-breath"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-breath [animation-delay:0.3s]"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-breath [animation-delay:0.6s]"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-10 bg-white border-t border-slate-50">
        <form onSubmit={handleSend} className="flex gap-5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your academic query..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-[32px] px-10 py-6 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-6 bg-slate-900 text-white rounded-[32px] shadow-2xl hover:bg-black transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center"
          >
            <Send size={28} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
