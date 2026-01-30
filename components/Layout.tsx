
import React from 'react';
import { User, AppView } from '../types';
import { 
  LayoutDashboard, 
  Library as LibraryIcon, 
  Timer, 
  MessageSquare, 
  Droplets,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Waves
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'chat', label: 'LiquidAI', icon: Droplets },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass-card border-r-0 rounded-r-[40px] p-8 fixed h-screen z-[50]">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="p-3 bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-900/40">
            <Waves size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-poppins font-bold text-xl text-white leading-none tracking-tight">LiquidAI</h1>
            <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-[0.2em] mt-1.5 opacity-80">HNS Hub Core</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSetView(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group relative ${
                  isActive 
                    ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
          <div className="px-4 py-3 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
               {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-white truncate">{user.email || user.name}</p>
              <p className="text-[8px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5">{user.role}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all font-bold group"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 lg:p-12 mb-24 md:mb-0">
        <header className="flex md:hidden items-center justify-between mb-8 px-2 pt-safe-top">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-600 rounded-xl">
               <Waves size={18} className="text-white" />
            </div>
            <h1 className="font-poppins font-bold text-lg text-white">LiquidAI</h1>
          </div>
          <button onClick={onLogout} className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-red-500 active:scale-90 transition-all">
             <LogOut size={18} />
          </button>
        </header>

        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Glass Dock */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 glass-dock rounded-[28px] px-8 py-4 flex justify-between items-center z-[100]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex flex-col items-center justify-center transition-all duration-300 relative ${
                isActive ? 'text-cyan-400 -translate-y-1 scale-110' : 'text-slate-500'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
