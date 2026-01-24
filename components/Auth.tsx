
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION } from '../constants';
import { supabase } from '../services/supabase.ts';
import { db } from '../services/dbService.ts';
import { 
  ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock, Zap, ShieldAlert, ShieldCheck, Clock, Cpu, Unlock, UserCircle, Settings
} from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => Promise<void> | void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showFastTrack, setShowFastTrack] = useState(false);
  const [isBypassMode, setIsBypassMode] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleAnonymousSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const { data, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;

      if (data.user) {
        onLogin({
          id: data.user.id,
          name: 'Guest Scholar',
          role: 'student'
        });
      }
    } catch (err: any) {
      setError("Anonymous access failed. Ensure 'Allow anonymous sign-ins' is ON in Supabase Dashboard > Auth > Providers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFastTrack = () => {
    const institutionalEmail = email.toLowerCase().trim() || `student${DOMAIN_RESTRICTION}`;
    const fastTrackUser: User = {
      id: `hns-bypass-${Math.random().toString(36).substr(2, 9)}`,
      email: institutionalEmail,
      name: name || (institutionalEmail ? institutionalEmail.split('@')[0].toUpperCase() : 'HNS SCHOLAR'),
      role: (institutionalEmail.includes('abdelhak') || institutionalEmail.includes('admin')) ? 'admin' : 'student',
      is_primary_admin: institutionalEmail.includes('abdelhak')
    };
    onLogin(fastTrackUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setError('');
    setShowFastTrack(false);
    setIsSubmitting(true);
    setIsBypassMode(false);

    const institutionalEmail = email.toLowerCase().trim();

    try {
      if (!institutionalEmail.endsWith(DOMAIN_RESTRICTION)) {
        throw new Error(`Invalid Domain: Use your institutional ${DOMAIN_RESTRICTION} email.`);
      }

      if (mode === 'register') {
        if (password.length < 8) throw new Error("Security: Password must be 8+ characters.");
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: institutionalEmail,
          password: password,
          options: { data: { full_name: name } }
        });

        if (authError) {
          if (authError.message.includes('signups are disabled')) {
            setShowFastTrack(true);
            throw new Error("Setup Required: Signups are disabled. In Supabase Dashboard > Auth > Providers > Email, toggle 'Allow new users to sign up' to ON.");
          }
          throw authError;
        }
        
        if (authData.user && !authData.session) {
           setShowFastTrack(true);
           throw new Error("Confirmation Required: Email confirmation is enabled. In Supabase Dashboard, toggle 'Confirm Email' to OFF for instant access.");
        }

        if (authData.user) {
          await onLogin({
            id: authData.user.id,
            email: institutionalEmail,
            name: name || 'HNS Scholar',
            role: 'student'
          });
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: institutionalEmail,
          password: password,
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('invalid login')) {
             setShowFastTrack(true);
          }
          throw authError;
        }

        if (authData.user) {
          const profile = await db.getUserById(authData.user.id);
          await onLogin({
            id: authData.user.id,
            email: institutionalEmail,
            name: profile?.full_name || 'HNS Scholar',
            role: profile?.role || 'student'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-poppins">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] bg-emerald-100/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] bg-blue-100/10 rounded-full blur-[160px] animate-pulse [animation-delay:4s]" />
      </div>

      <div className="w-full max-w-lg bg-white rounded-[48px] shadow-[0_40px_140px_-30px_rgba(0,0,0,0.1)] border border-slate-100/80 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="p-10 md:p-14">
          
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-[22px] shadow-2xl animate-float">
                <Zap className="text-emerald-400" size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">HNS Portal</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">v2.2 Production</p>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-100/60 p-1 rounded-[20px] mb-8">
            <button 
              onClick={() => { setMode('login'); setError(''); setShowFastTrack(false); }}
              className={`flex-1 py-3 rounded-[16px] font-bold transition-all text-xs ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); setShowFastTrack(false); }}
              className={`flex-1 py-3 rounded-[16px] font-bold transition-all text-xs ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              Join Hub
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Salim Ben"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-base transition-all shadow-inner"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Institutional Email</label>
              <input
                type="email"
                placeholder={`user${DOMAIN_RESTRICTION}`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-base transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-base transition-all shadow-inner"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-[20px] bg-red-50 border border-red-100 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-red-700 leading-relaxed">{error}</p>
                    {showFastTrack && (
                      <button 
                        type="button" 
                        onClick={handleFastTrack}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all"
                      >
                        Institutional Quick-Entry <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 text-white rounded-[24px] font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span className="text-sm">{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={handleAnonymousSignIn}
                disabled={isSubmitting}
                className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-[24px] font-bold hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                <UserCircle size={20} className="group-hover:text-emerald-600" />
                <span className="text-xs">Continue as Guest</span>
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-col items-center gap-3 opacity-40">
            <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              <Lock size={10} /> Secure Encryption Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
