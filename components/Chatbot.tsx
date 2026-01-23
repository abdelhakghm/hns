
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyAdvice } from '../services/geminiService.ts';
import { db } from '../services/dbService.ts';
import { User } from '../types';
import { Send, User as UserIcon, Bot, Sparkles, Loader2, Info, AlertTriangle, History } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isApiKeyMissing = !process.env.API_KEY || process.env.API_KEY === '';

  useEffect(() => {
    loadChatHistory();
  }, [user.id]);

  const loadChatHistory = async () => {
    try {
      const history = await db.getChatHistory(user.id);
      if (history.length > 0) {
        setMessages(history as Message[]);
      } else {
        const welcome = { role: 'assistant' as const, content: 'Hello! I am your HNS Academic Assistant. Your conversations are now saved to the Neon Cloud.' };
        setMessages([welcome]);
        await db.saveChatMessage(user.id, welcome.role, welcome.content);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isApiKeyMissing) return;

    const userMessage = input.trim();
    setInput('');
    
    // Save User message to Cloud
    await db.saveChatMessage(user.id, 'user', userMessage);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsLoading(true);
    const response = await generateStudyAdvice(userMessage);
    
    // Save Assistant message to Cloud
    await db.saveChatMessage(user.id, 'assistant', response || 'No response.');
    setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sorry, I missed that.' }]);
    setIsLoading(false);
  };

  if (isApiKeyMissing) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-[40px] border border-slate-200 items-center justify-center p-8 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-6" />
        <h2 className="text-2xl font-poppins font-bold text-slate-800">Assistant Unavailable</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto">Database link is active, but AI model requires an API Key.</p>
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
              <span className="text-xs text-emerald-100 font-medium tracking-tight">Cloud Persistent Sync</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Loader2 className="animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Fetching Chat History...</p>
          </div>
        ) : (
          <>
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
                      ? 'bg-emerald-600 text-white shadow-lg rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
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
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything... conversations are synced across your devices."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
