
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
  Video
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
    { id: 'dashboard', label: 'My Progress', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'focus', label: 'Study Focus', icon: Timer },
    { id: 'chat', label: 'HNS Assistant', icon: MessageSquare },
    { id: 'vision', label: 'Vision Lab', icon: Video },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  const LogoComponent = ({ className }: { className?: string }) => (
    <img 
      src={APP_LOGO_URL} 
      alt="HNS RE2SD Logo" 
      className={className || "w-12 h-12 object-contain"}
    />
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-poppins">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-8 fixed h-full shadow-sm z-[50]">
        <div className="flex items-center gap-4 mb-14">
          <div className="bg-slate-50 p-2.5 rounded-[18px] border border-slate-100 shadow-sm">
            <LogoComponent className="w-10 h-10 object-contain" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-2xl text-slate-900 leading-none tracking-tight">HNS Hub</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1 opacity-80">Academic Core</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2.5">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4 px-4">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSetView(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[22px] transition-all duration-500 font-bold group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={22} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[13px]">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-50">
          <div className="flex items-center gap-4 p-4 mb-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:shadow-md transition-all cursor-default">
            <div className="w-12 h-12 rounded-[18px] bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner ring-4 ring-white">
               {user.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate leading-tight">{user.name}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">{user.role}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 rounded-[22px] transition-all duration-300 font-bold text-sm border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-32 md:pb-12 bg-slate-50/50">
        <header className="mb-8 flex justify-between items-center md:hidden bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <LogoComponent className="w-9 h-9 object-contain" />
            <div className="h-6 w-px bg-slate-100 mx-1"></div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">HNS Hub</span>
          </div>
          <button className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-emerald-50">
            {user.name.charAt(0)}
          </button>
        </header>

        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-top-4 duration-1000">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-5 flex justify-between items-center z-[100] shadow-2xl rounded-[32px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex flex-col items-center gap-2 transition-all duration-500 ${
                isActive ? 'text-emerald-400 scale-125' : 'text-slate-400 opacity-60'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
