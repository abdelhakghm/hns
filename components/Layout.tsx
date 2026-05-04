
import React from 'react';
import { User } from '../types';
import { Power, Terminal } from 'lucide-react';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30 font-sans">
      {/* Precision Header */}
      <header className="px-8 py-8 md:px-16 lg:px-24 flex items-center justify-between border-b border-white/[0.05] sticky top-0 bg-[#020202]/90 backdrop-blur-xl z-[150]">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <div className="flex items-baseline gap-2">
                <h1 className="font-bold text-xl tracking-tight leading-none">
                  Academic Matrix
                </h1>
                <span className="text-[10px] text-emerald-500 font-medium opacity-50 block">v3.2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                 <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">Scholar</p>
                 <p className="text-sm font-semibold text-white tracking-tight">{user.name}</p>
              </div>
              <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 group">
                 <Power size={16} className="text-emerald-500" />
              </button>
           </div>
        </div>
      </header>

      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.02)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* Main Stage */}
      <main className="relative p-8 md:p-12 lg:p-20 min-h-[calc(100vh-160px)] z-10">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-12 py-10 border-t border-white/[0.03] bg-[#010101] relative overflow-hidden">
         <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3">
               <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`w-4 h-0.5 ${i < 2 ? 'bg-emerald-500' : 'bg-white/5'}`} />
                  ))}
               </div>
               <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest leading-none">Institutional Academic Protocol</p>
            </div>

            <div className="flex flex-col md:items-end gap-1">
               <div className="flex gap-4 font-medium text-[10px] text-slate-500 tracking-wider uppercase">
                  <span>© {new Date().getFullYear()}</span>
                  <span className="text-white/5">|</span>
                  <span>Matrix Engine</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default AppLayout;
