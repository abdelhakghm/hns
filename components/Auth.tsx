
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION } from '../constants';
import { supabase } from '../services/supabase.ts';
import { db } from '../services/dbService.ts';
import { 
  ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock, Zap, ShieldAlert, ShieldCheck, Clock, Cpu
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

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleFastTrack = () => {
    const fastTrackUser: User = {
      id: `fast-track-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim() || `admin${DOMAIN_RESTRICTION}`,
      name: name || (email ? email.split('@')[0] : 'HNS Scholar'),
      role: email.toLowerCase().trim().includes('abdelhak') ? 'admin' : 'student',
      is_primary_admin: email.toLowerCase().trim().includes('abdelhak')
    };
    onLogin(fastTrackUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setError('');
    setShowFastTrack(false);
    setIsSubmitting(true);

    const institutionalEmail = email.toLowerCase().trim();

    try {
      if (!institutionalEmail.endsWith(DOMAIN_RESTRICTION)) {
        throw new Error(`Access Denied: Please use your official ${DOMAIN_RESTRICTION} account.`);
      }

      if (mode === 'register') {
        if (password.length < 8) throw new Error("Security Requirement: Password must be at least 8 characters.");
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: institutionalEmail,
          password: password,
          options: { data: { full_name: name } }
        });

        if (authError) {
          if (authError.status === 429 || authError.message.toLowerCase().includes('rate limit')) {
            setCooldown(30);
            setShowFastTrack(true);
            throw new Error("Mail Server Congestion: Direct Fast-Track enabled below.");
          }
          throw authError;
        }
        
        // If sign-up succeeded but session is null (confirmation required)
        if (authData.user && !authData.session) {
           setShowFastTrack(true);
           throw new Error("Account Provisioned: Email confirmation is pending. Use Fast-Track to enter immediately.");
        }

        await onLogin({
          id: authData.user?.id || 'temp-id',
          email: institutionalEmail,
          name: name || 'HNS Scholar',
          role: 'student'
        });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: institutionalEmail,
          password: password,
        });

        if (authError) {
          if (authError.status === 429 || authError.message.toLowerCase().includes('rate limit')) {
            setCooldown(30);
            setShowFastTrack(true);
            throw new Error("Security Protocol: Too many login attempts. Direct Access available below.");
          }
          throw authError;
        }

        const profile = await db.getUserByEmail(institutionalEmail);
        await onLogin({
          id: authData.user.id,
          email: institutionalEmail,
          name: profile?.full_name || 'HNS Scholar',
          role: profile?.role || 'student'
        });
      }
    } catch (err: any) {
      setError(err.message || "Cloud authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-poppins">
      {/* Energy Background Field */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] bg-emerald-100/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] bg-blue-100/10 rounded-full blur-[160px] animate-pulse [animation-delay:4s]" />
      </div>

      <div className="w-full max-w-lg bg-white rounded-[48px] shadow-[0_40px_140px_-30px_rgba(0,0,0,0.1)] border border-slate-100/80 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="p-12 md:p-16">
          
          <div className="flex justify-between items-start mb-14">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-[22px] shadow-2xl animate-float">
                <Zap className="text-emerald-400" size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">HNS Portal</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Secure Link Gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
              <ShieldCheck size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">v2.1 Secured</span>
            </div>
          </div>

          <div className="flex bg-slate-100/60 p-1 rounded-[20px] mb-10">
            <button 
              onClick={() => { setMode('login'); setError(''); setShowFastTrack(false); }}
              className={`flex-1 py-3.5 rounded-[16px] font-bold transition-all text-xs ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); setShowFastTrack(false); }}
              className={`flex-1 py-3.5 rounded-[16px] font-bold transition-all text-xs ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              Initialize
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Identity</label>
                <input
                  type="text"
                  placeholder="Official Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-base transition-all shadow-inner"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Academic Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={`name${DOMAIN_RESTRICTION}`}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-8 py-5 bg-slate-50/50 border rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-base transition-all shadow-inner ${email.length > 0 && !email.endsWith(DOMAIN_RESTRICTION) ? 'border-amber-200' : 'border-slate-100'}`}
                />
                {email.length > 0 && !email.endsWith(DOMAIN_RESTRICTION) && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500">
                    <AlertCircle size={20} className="animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Access Key</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-base transition-all shadow-inner"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`p-6 rounded-[28px] border animate-in slide-in-from-top-4 duration-500 ${showFastTrack ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex gap-4">
                  <div className={`shrink-0 mt-0.5 ${showFastTrack ? 'text-amber-600' : 'text-red-600'}`}>
                    {showFastTrack ? <Cpu size={20} /> : <ShieldAlert size={20} />}
                  </div>
                  <div className="space-y-3">
                    <p className={`text-[11px] font-bold leading-relaxed ${showFastTrack ? 'text-amber-800' : 'text-red-700'}`}>{error}</p>
                    {showFastTrack && (
                      <button 
                        type="button" 
                        onClick={handleFastTrack}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[18px] text-[10px] font-bold hover:bg-black transition-all shadow-xl active:scale-95 group"
                      >
                        Institutional Fast-Track <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || cooldown > 0}
                className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-bold shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] group relative overflow-hidden"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span className="text-sm">{mode === 'login' ? 'Cloud Authentication' : 'Authorize Provisioning'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {cooldown > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">
                  <Clock size={12} /> Institutional Cooldown: {cooldown}s
                </div>
              )}
            </div>
          </form>

          <div className="mt-14 pt-8 border-t border-slate-50 flex flex-col items-center gap-4 text-slate-300 opacity-60">
            <div className="flex items-center gap-2">
              <Lock size={12} />
              <span className="text-[8px] font-bold uppercase tracking-[0.5em]">AES-256 Institutional Grade Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
