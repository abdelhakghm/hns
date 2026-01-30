
import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { 
  Zap, Lock, Mail, Key, ArrowRight, Loader2, UserPlus, LogIn, User as UserIcon, CheckCircle2, ShieldAlert, AlertTriangle
} from 'lucide-react';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

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
              message: "Identity already exists. Redirecting to Login...", 
              type: 'warning' 
            });
            setTimeout(() => {
              setMode('login');
              setError(null);
            }, 2500);
            return;
          }
          throw signUpError;
        }

        if (data.session) {
          onAuthSuccess();
        } else if (data.user) {
          setMode('login');
          setError({ 
            message: "Identity registration initiated. You can now log in directly.", 
            type: 'success' 
          });
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (signInError) {
          if (signInError.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error("Access Denied: The email or key provided is incorrect.");
          }
          throw signInError;
        }
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError({ 
        message: err.message || "A secure connection could not be established.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Kinetic FX */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-[40px] p-10 md:p-12 border border-emerald-500/20 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 mb-6 animate-float">
            <Zap className="text-white fill-white" size={28} />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-white tracking-tighter">HNS Hub</h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-2">Access Portal</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 border border-white/5">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LogIn size={14} /> Login
          </button>
          <button 
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
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
                  placeholder="Scholar Name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-900/40 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all text-sm"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
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
            <div className={`p-4 rounded-2xl border flex gap-3 items-start animate-in slide-in-from-top-2 transition-colors ${
              error.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 
              error.type === 'warning' ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' :
              'bg-red-950/30 border-red-500/30 text-red-200'
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

        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
          <Lock size={12} className="text-slate-500" />
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secured Core Link Active</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
