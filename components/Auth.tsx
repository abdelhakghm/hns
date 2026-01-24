
import React, { useState } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION, PRIMARY_ADMIN_EMAIL } from '../constants';
import { supabase } from '../services/supabase.ts';
import { db } from '../services/dbService.ts';
import { 
  ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock, Zap, ShieldAlert, UserCircle
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
  const [captchaError, setCaptchaError] = useState(false);

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
      if (err.message?.toLowerCase().includes('captcha')) {
        setCaptchaError(true);
        setError("Captcha Block: Your Supabase security settings are blocking guest access.");
      } else {
        setError("Guest Bridge Unavailable. Check project configuration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyBypass = () => {
    const isPrimary = email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    onLogin({
      id: 'dev-bypass-' + Math.random().toString(36).substr(2, 9),
      email: email || 'student@hns-re2sd.dz',
      name: name || (email ? email.split('@')[0].toUpperCase() : 'HNS Scholar'),
      role: isPrimary ? 'admin' : 'student'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError(false);
    setIsSubmitting(true);

    const institutionalEmail = email.toLowerCase().trim();

    try {
      if (!institutionalEmail.endsWith(DOMAIN_RESTRICTION)) {
        throw new Error(`Invalid Domain: Use your @hns-re2sd.dz email.`);
      }

      if (mode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: institutionalEmail,
          password: password,
          options: { data: { full_name: name } }
        });

        if (authError) {
          if (authError.message?.toLowerCase().includes('captcha')) {
            setCaptchaError(true);
            throw new Error("Captcha Verification Failed: Security settings require token validation.");
          }
          throw authError;
        }
        
        if (authData.user && !authData.session) {
           throw new Error("Confirmation Pending: Check your institutional inbox for the activation link.");
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
          if (authError.message?.toLowerCase().includes('captcha')) {
            setCaptchaError(true);
            throw new Error("Captcha Blocked: Supabase requires a token. Disable Captcha in your dashboard.");
          }
          throw authError;
        }

        if (authData.user) {
          const profile = await db.getUserById(authData.user.id);
          await onLogin({
            id: authData.user.id,
            email: institutionalEmail,
            name: profile?.full_name || 'HNS Scholar',
            role: (profile?.role as 'student' | 'admin') || 'student'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication Bridge Error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-poppins relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-lg glass-card rounded-[40px] p-10 md:p-14 relative z-10 border border-emerald-500/20 shadow-2xl">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-5 bg-emerald-600 rounded-[28px] shadow-lg shadow-emerald-500/30 mb-6 animate-float">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter leading-none mb-2">HNS HUB</h1>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.5em]">Kinetic Security v2.4</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 border border-white/5">
          <button 
            onClick={() => { setMode('login'); setError(''); setCaptchaError(false); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs ${mode === 'login' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setMode('register'); setError(''); setCaptchaError(false); }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs ${mode === 'register' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Full Identity</label>
              <input
                type="text"
                placeholder="Name Surname"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-8 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Academic Email</label>
            <input
              type="email"
              placeholder={`user${DOMAIN_RESTRICTION}`}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Access Code</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl border ${captchaError ? 'bg-amber-950/30 border-amber-500/30' : 'bg-red-950/30 border-red-500/30'} animate-in slide-in-from-top-2`}>
              <div className="flex gap-3">
                <AlertCircle size={16} className={captchaError ? 'text-amber-500 shrink-0 mt-0.5' : 'text-red-500 shrink-0 mt-0.5'} />
                <div className="space-y-3 flex-1">
                  <p className={`text-[11px] font-bold ${captchaError ? 'text-amber-200' : 'text-red-200'} leading-relaxed`}>
                    {error}
                  </p>
                  
                  {captchaError && (
                    <div className="space-y-3">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] text-amber-400 font-bold uppercase mb-1">How to fix:</p>
                        <p className="text-[10px] text-slate-400">Open <b>Supabase Dashboard > Auth > Settings</b> and turn <b>OFF</b> "Enable Captcha".</p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleEmergencyBypass}
                        className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 border border-amber-600/30 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Emergency Bypass Mode
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/10 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="text-sm tracking-wide uppercase">{mode === 'login' ? 'Initiate Link' : 'Register identity'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div className="flex items-center gap-4 py-2 opacity-20">
              <div className="h-px bg-slate-500 flex-1"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or</span>
              <div className="h-px bg-slate-500 flex-1"></div>
            </div>

            <button
              type="button"
              onClick={handleAnonymousSignIn}
              disabled={isSubmitting}
              className="w-full py-4 bg-transparent border border-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              <UserCircle size={20} className="group-hover:text-emerald-500" />
              <span className="text-xs uppercase tracking-wider">Observer Access (Guest)</span>
            </button>
          </div>
        </form>

        <div className="mt-10 flex flex-col items-center gap-3 opacity-30">
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em]">
            <Lock size={10} /> Secure Node Active
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 text-center w-full max-w-lg px-10 animate-in fade-in duration-1000">
        <p className="text-[10px] text-slate-600 font-medium">
          Admin Tip: If login fails, use the <b>Emergency Bypass</b> button to enter as an admin while you fix your project settings.
        </p>
      </div>
    </div>
  );
};

export default Auth;
