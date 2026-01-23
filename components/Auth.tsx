
import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { DOMAIN_RESTRICTION, APP_LOGO_URL, PRIMARY_ADMIN_EMAIL } from '../constants';
import { db } from '../services/dbService.ts';
import { 
  ArrowRight, UserPlus, LogIn, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff, Lock
} from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => Promise<void>;
}

// وظيفة التشفير الآمن (Client-side Hashing)
const hashPassword = async (password: string, salt: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const saltData = encoder.encode(salt);
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw', data, 'PBKDF2', false, ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltData, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await window.crypto.subtle.exportKey('raw', derivedKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

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
        throw new Error(`الوصول مقتصر على حسابات ${DOMAIN_RESTRICTION} فقط.`);
      }

      if (mode === 'register') {
        if (password.length < 8) throw new Error("يجب أن تكون كلمة المرور 8 أحرف على الأقل.");
        
        // التحقق من وجود الحساب مسبقاً
        const existing = await db.getUserByEmail(institutionalEmail);
        if (existing) throw new Error("هذا الحساب مسجل بالفعل. يرجى تسجيل الدخول.");

        // إنشاء الملح وتشفير كلمة المرور
        const salt = window.crypto.randomUUID();
        const password_hash = await hashPassword(password, salt);
        
        // تحديد الدور: طالب بشكل افتراضي، إلا إذا كان الإيميل هو الأدمن الأساسي
        const role = institutionalEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student';

        const profile = await db.createProfile({
          email: institutionalEmail,
          name,
          password_hash,
          salt,
          role
        });

        await onLogin({
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          isPrimary: profile.role === 'admin'
        });
      } else {
        // وضع تسجيل الدخول
        const profile = await db.getUserByEmail(institutionalEmail);
        if (!profile) throw new Error("الحساب غير موجود. يرجى إنشاء حساب أولاً.");

        const attemptHash = await hashPassword(password, profile.salt);
        if (attemptHash !== profile.password_hash) {
          throw new Error("كلمة المرور غير صحيحة.");
        }

        await onLogin({
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          isPrimary: profile.is_primary_admin
        });
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بخادم الحماية.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-emerald-100/50 border border-slate-100 overflow-hidden">
        <div className="p-10 text-center">
          <img src={APP_LOGO_URL} alt="HNS Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-poppins font-bold text-slate-900">بوابة HNS</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">نظام الدخول الموحد للمدرسة العليا</p>
        </div>

        <div className="px-10 pb-10">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              دخول
            </button>
            <button 
              onClick={() => setMode('register')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
              تسجيل
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="الاسم الكامل"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />
            )}
            
            <input
              type="email"
              placeholder={`البريد الجامعي (${DOMAIN_RESTRICTION})`}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl text-xs font-bold border border-red-100">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === 'login' ? 'فتح البوابة' : 'إنشاء حساب جديد'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <Lock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">تشفير PBKDF2 مفعل</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
