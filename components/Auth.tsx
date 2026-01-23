
import React, { useState } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION, APP_LOGO_URL } from '../constants';
import { supabase } from '../services/supabase.ts';
import { db } from '../services/dbService.ts';
import { 
  ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Lock
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const institutionalEmail = email.toLowerCase().trim();

    try {
      if (!institutionalEmail.endsWith(DOMAIN_RESTRICTION)) {
        throw new Error(`Access restricted to ${DOMAIN_RESTRICTION} accounts only.`);
      }

      if (mode === 'register') {
        if (password.length < 8) throw new Error("Password must be at least 8 characters long.");
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: institutionalEmail,
          password: password,
          options: {
            data: { full_name: name }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user profile.");

        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const profile = await db.getUserByEmail(institutionalEmail);
        
        await onLogin({
          id: authData.user.id,
          email: institutionalEmail,
          name: name || profile?.full_name || 'New Student',
          role: profile?.role || 'student',
          is_primary_admin: profile?.role === 'admin'
        });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: institutionalEmail,
          password: password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Login failed.");

        const profile = await db.getUserByEmail(institutionalEmail);

        await onLogin({
          id: authData.user.id,
          email: institutionalEmail,
          name: profile?.full_name || 'HNS Student',
          role: profile?.role || 'student',
          is_primary_admin: profile?.role === 'admin'
        });
      }
    } catch (err: any) {
      setError(err.message || "A connection error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-emerald-100/50 border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="p-12 text-center pb-8">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-emerald-50 rounded-full scale-150 blur-xl opacity-50" />
            <img 
              src={APP_LOGO_URL} 
              alt="HNS Institutional Logo" 
              className="w-24 h-24 mx-auto relative z-10 drop-shadow-2xl transition-transform hover:scale-105 duration-500" 
            />
          </div>
          <h1 className="text-4xl font-poppins font-bold text-slate-900 tracking-tight">HNS Hub</h1>
          <p className="text-slate-400 text-[10px] mt-3 font-bold uppercase tracking-[0.2em]">Single Sign-On for the Higher School</p>
        </div>

        <div className="px-10 pb-12">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all text-sm ${mode === 'login' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl font-bold transition-all text-sm ${mode === 'register' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
                />
              </div>
            )}
            
            <input
              type="email"
              placeholder={`Institutional Email (${DOMAIN_RESTRICTION})`}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl text-[11px] font-bold border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <>
                  <span className="text-base">{mode === 'login' ? 'Login to Hub' : 'Create Account'}</span>
                  <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-3 text-slate-300">
            <div className="h-px w-8 bg-slate-100" />
            <div className="flex items-center gap-2">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">HNS Secure</span>
            </div>
            <div className="h-px w-8 bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
