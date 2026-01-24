
import React from 'react';
import { User, AppView } from '../types';
import { 
  LayoutDashboard, 
  Library as LibraryIcon, 
  Timer, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Cpu
} from 'lucide-react';

interface LayoutProps {
  user: User | null;
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ user, currentView, onSetView, onLogout, children }) => {
  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Academic Synapse', icon: LayoutDashboard },
    { id: 'library', label: 'Resource Core', icon: LibraryIcon },
    { id: 'focus', label: 'Kinetic Focus', icon: Timer },
    { id: 'chat', label: 'Neural Assistant', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Security Console', icon: ShieldCheck });
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-poppins text-slate-200">
      {/* Futuristic Cockpit Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass-card border-r-0 rounded-r-[48px] p-8 fixed h-full z-[50] animate-in slide-in-from-left duration-700">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/40">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white leading-none tracking-tighter">HNS Hub</h1>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Link Active</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-4 px-4">Core Modules</p>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSetView(item.id as AppView)}
                className={`w-full flex items-center gap-3.5 px-6 py-3.5 rounded-2xl transition-all font-bold relative group ${
                  isActive 
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-3.5 p-4 mb-4 bg-slate-900/40 rounded-2xl border border-white/5 group transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-emerald-500/20">
               {user.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user.name}</span>
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">{user.role} mode</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-xs"
          >
            <LogOut size={16} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Surface */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-32 md:pb-12">
        <header className="mb-10 flex justify-between items-center md:hidden glass-card p-5 rounded-[28px] border-emerald-500/10 sticky top-4 z-[40]">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-emerald-500" />
            <span className="font-bold text-lg text-white tracking-tight">HNS Hub</span>
          </div>
          <button className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
            {user.name.charAt(0)}
          </button>
        </header>

        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Navigation Dock - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 glass-card border-white/10 px-8 py-5 flex justify-between items-center z-[100] shadow-2xl rounded-[32px] animate-in slide-in-from-bottom-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-emerald-400 scale-110' : 'text-slate-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
