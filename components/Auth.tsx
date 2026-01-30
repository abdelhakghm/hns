
import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { 
  Zap, Lock, Mail, Key, ArrowRight, Loader2, UserPlus, LogIn, User as UserIcon, CheckCircle2, ShieldAlert, AlertTriangle, Globe
} from 'lucide-react';
import { DOMAIN_RESTRICTION } from '../constants.ts';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

  const toggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Security check for password length
    if (password.length < 6) {
      setError({ message: "Security protocol: Access Key must be at least 6 characters.", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName || cleanEmail.split('@')[0],
            },
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered')) {
            setError({ 
              message: "Identity found in HNS Registry. Switching to Login mode...", 
              type: 'warning' 
            });
            setTimeout(() => toggleMode('login'), 1500);
            return;
          }
          throw signUpError;
        }

        if (data.session) {
          onAuthSuccess();
        } else if (data.user) {
          setError({ 
            message: "Node registration success! Please verify the link sent to " + cleanEmail + " to activate your node.", 
            type: 'success' 
          });
          setPassword('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (signInError) {
          const msg = signInError.message.toLowerCase();
          /**
           * FIX: Addressing 'Access Denied' error. 
           * This error occurs when the user tries to login with a non-existent account or wrong password.
           */
          if (msg.includes('invalid login credentials')) {
            throw new Error("Access Denied: The email or secret key is incorrect. If you haven't joined the HNS Hub yet, please switch to 'Join Hub' to register your identity.");
          } else if (msg.includes('email not confirmed')) {
            throw new Error("Activation Pending: Your account exists but hasn't been verified. Check your institutional email for the activation link.");
          }
          throw signInError;
        }
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError({ 
        message: err.message || "A secure connection could not be established with the HNS Cloud.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Kinetic FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md glass-card rounded-[40px] p-10 md:p-12 border border-emerald-500/20 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 mb-6 animate-float">
            <Zap className="text-white fill-white" size={28} />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-white tracking-tighter">HNS Hub</h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-2 text-center">Scholar Access Portal</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl mb-8 border border-white/5">
          <button 
            type="button"
            onClick={() => toggleMode('login')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LogIn size={14} /> Login
          </button>
          <button 
            type="button"
            onClick={() => toggleMode('signup')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <UserPlus size={14} /> Join Hub
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Full Identity Name</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all text-sm"
                  placeholder="e.g. Amina Mansouri"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">HNS Institutional Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all text-sm"
                placeholder={`user${DOMAIN_RESTRICTION}`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Secret Access Key</label>
            <div className="relative">
              <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl border flex gap-3 items-start animate-in slide-in-from-top-2 transition-all ${
              error.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 
              error.type === 'warning' ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' :
              'bg-red-950/40 border-red-500/30 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
            }`}>
              {error.type === 'success' && <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />}
              {error.type === 'warning' && <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />}
              {error.type === 'error' && <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />}
              <p className="text-[11px] font-bold leading-relaxed">{error.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/10 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span className="text-xs uppercase tracking-widest">{mode === 'login' ? 'Initiate Link' : 'Register Identity'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-slate-500" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secured Core Link Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-slate-500" />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic text-center">HNS Higher School Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
