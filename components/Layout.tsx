
import React from 'react';
import { User, AppView } from '../types';
import { APP_LOGO_URL } from '../constants';
import { 
  LayoutDashboard, 
  Library as LibraryIcon, 
  Timer, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap
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
    { id: 'dashboard', label: 'Academic Pulse', icon: LayoutDashboard },
    { id: 'library', label: 'Resource Library', icon: LibraryIcon },
    { id: 'focus', label: 'Focus Chamber', icon: Timer },
    { id: 'chat', label: 'Neural Assistant', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'System Control', icon: ShieldCheck });
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fcfdfe] font-poppins selection:bg-emerald-100 selection:text-emerald-900">
      {/* High-End Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-100 p-10 fixed h-full z-[50] animate-in slide-in-from-left duration-1000">
        <div className="flex items-center gap-4 mb-16 px-2 animate-float">
          <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-100">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-slate-900 leading-none tracking-tighter">HNS Hub</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 opacity-80">v2.1 Stable</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6 px-4">Workspace Core</p>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSetView(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[28px] transition-all font-bold group relative overflow-hidden stagger-item ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
                style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className="text-sm relative z-10">{item.label}</span>
                {isActive && (
                  <div className="ml-auto relative z-10 bg-emerald-500 w-1.5 h-1.5 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-10 border-t border-slate-50">
          <div className="flex items-center gap-4 p-5 mb-6 bg-slate-50 rounded-[32px] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
            <div className="w-12 h-12 rounded-[18px] bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:rotate-12 transition-transform">
               {user.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate leading-none">{user.name}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{user.role} mode</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[28px] transition-all font-bold text-sm group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 p-6 md:p-16 pb-32 md:pb-16 bg-[#fcfdfe]">
        <header className="mb-10 flex justify-between items-center md:hidden bg-white/70 backdrop-blur-xl p-5 rounded-[32px] shadow-sm border border-slate-100 sticky top-4 z-[40]">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-emerald-600" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">HNS Hub</span>
          </div>
          <button className="w-10 h-10 rounded-[14px] bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-100">
            {user.name.charAt(0)}
          </button>
        </header>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Futuristic Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-8 py-6 flex justify-between items-center z-[100] shadow-2xl rounded-[40px] animate-in slide-in-from-bottom-10 duration-700">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex flex-col items-center gap-2 transition-all relative ${
                isActive ? 'text-emerald-400 scale-110 -translate-y-1' : 'text-slate-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
