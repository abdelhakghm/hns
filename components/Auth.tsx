
import React, { useState } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION, PRIMARY_ADMIN_EMAIL, APP_LOGO_URL } from '../constants';
import { Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, UserPlus, LogIn, Globe } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  adminEmails: string[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, adminEmails }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.endsWith(DOMAIN_RESTRICTION)) {
      setError(`Access restricted. Use your ${DOMAIN_RESTRICTION} email.`);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const usersDB = JSON.parse(localStorage.getItem('hns_users_db') || '[]');
      
      if (mode === 'register') {
        const existing = usersDB.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setError('This email is already registered. Please sign in.');
          setIsLoading(false);
          return;
        }

        const newUserRecord = {
          id: Math.random().toString(36).substr(2, 9),
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          password,
        };

        localStorage.setItem('hns_users_db', JSON.stringify([...usersDB, newUserRecord]));
        completeLogin(newUserRecord);
      } else {
        const found = usersDB.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (!found || found.password !== password) {
          setError('Invalid email or password. Please try again.');
          setIsLoading(false);
          return;
        }
        completeLogin(found);
      }
    }, 800);
  };

  const completeLogin = (userRecord: any) => {
    const isPrimary = userRecord.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    const isSecondaryAdmin = adminEmails.some(ae => ae.toLowerCase() === userRecord.email.toLowerCase());
    
    let userRole: 'student' | 'admin' = (isPrimary || isSecondaryAdmin) ? 'admin' : 'student';

    onLogin({
      id: userRecord.id,
      email: userRecord.email,
      name: isPrimary ? 'Abdelhak Guehmam' : userRecord.name,
      role: userRole,
      isPrimary
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-emerald-500 to-blue-500"></div>
        
        <div className="bg-white p-10 pb-4 text-center relative flex flex-col items-center">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-emerald-50 border border-slate-50 mb-6 transition-transform hover:scale-105 duration-500">
            <img 
              src={APP_LOGO_URL} 
              alt="HNS RE2SD Logo" 
              className="w-28 h-28 object-contain animate-in fade-in zoom-in duration-1000"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=HNS&backgroundColor=10b981';
              }}
            />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800 tracking-tight">HNS Companion</h1>
          <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Renewable Energy Hub</p>
        </div>
        
        <div className="px-10 pb-10 pt-4 flex-1">
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LogIn size={18} />
              Login
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <UserPlus size={18} />
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500">
                  <UserIcon size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder={`Email (${DOMAIN_RESTRICTION})`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-2xl flex items-center gap-3 border border-red-100 animate-in shake duration-300">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-4 rounded-[28px] shadow-xl shadow-emerald-100 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Unlock Dashboard' : 'Create My Profile'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            <div className="mt-8 text-center flex flex-col gap-4">
               <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <Globe size={14} />
                  Institutional Access Only
               </div>
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-2">
                by Abdelhak Guehmam
              </p>
            </div>
          </form>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Higher School of Renewable Energies
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;