
import React from 'react';
import { User, AppView } from '../types';
import { 
  Library as LibraryIcon, 
  Timer, 
  Zap,
  Calculator,
  ListTodo,
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: AppView;
  onSetView: (view: AppView) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ user, currentView, onSetView, children }) => {

  const navItems = [
    { id: 'todo', label: 'Objectives', icon: ListTodo },
    { id: 'grades', label: 'Average Calc', icon: Calculator },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass-card border-r-0 rounded-r-[40px] p-8 fixed h-screen z-[50]">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/40">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-poppins font-bold text-xl text-white leading-none tracking-tight">HNS Hub</h1>
            <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1.5 opacity-80">Institutional Core</p>
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
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="px-4 py-3 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
              <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Academic Guest</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 lg:p-12 mb-32 md:mb-0">
        <header className="flex md:hidden items-center justify-between mb-8 px-2 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/40">
               <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-lg text-white leading-none">HNS Hub</h1>
              <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Institutional Core</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-emerald-500">
             {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Glass Dock - Improved Visibility and Touch Targets */}
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] glass-dock rounded-[32px] px-2 py-2 flex justify-between items-center z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-2xl -z-10" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex-1 flex flex-col items-center justify-center py-3.5 transition-all duration-300 relative rounded-2xl ${
                isActive ? 'text-emerald-400' : 'text-slate-500 active:scale-90 active:bg-white/5'
              }`}
            >
              <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[8px] font-bold uppercase tracking-tight mt-1.5 transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                {item.label.split(' ')[0]}
              </span>
              {isActive && (
                <div className="absolute top-0 inset-x-2 h-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
