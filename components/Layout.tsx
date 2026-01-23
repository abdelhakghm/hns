
import React from 'react';
import { User, AppView } from '../types';
import { APP_LOGO_URL } from '../constants';
import { 
  LayoutDashboard, 
  Library as LibraryIcon, 
  Timer, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, currentView, onSetView, onLogout, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'My Progress', icon: LayoutDashboard },
    { id: 'library', label: 'Academic Files', icon: LibraryIcon },
    { id: 'focus', label: 'Study Focus', icon: Timer },
    { id: 'chat', label: 'HNS Assistant', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  const LogoComponent = ({ className }: { className?: string }) => (
    <img 
      src={APP_LOGO_URL} 
      alt="HNS RE2SD Logo" 
      className={className || "w-10 h-10 object-contain"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=HNS&backgroundColor=10b981';
      }}
    />
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-6 fixed h-full shadow-sm">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm">
            <LogoComponent className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="font-poppins font-bold text-lg text-slate-800 leading-none tracking-tight">HNS</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Companion</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSetView(item.id as AppView)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
               {user.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">{user.name}</span>
              <span className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-tighter">{user.role}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 font-bold text-sm"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-10 pb-28 md:pb-10">
        {/* Mobile App Header */}
        <header className="mb-8 flex justify-between items-center md:hidden bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <LogoComponent className="w-8 h-8 object-contain" />
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <span className="font-poppins font-bold text-lg text-slate-800 tracking-tight">HNS</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-lg border border-white/20 px-6 py-4 flex justify-between items-center z-50 shadow-2xl rounded-[32px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as AppView)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-emerald-600 scale-110' : 'text-slate-400'
              }`}
            >
              <Icon size={22} className={isActive ? "fill-emerald-50" : ""} />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;