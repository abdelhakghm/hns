
import React, { useState, useEffect } from 'react';
import { FileResource, User } from '../types';
import { 
  Trash2, Database, Terminal, 
  Copy, Check, CloudLightning, RefreshCw, 
  Settings2, Activity, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { db } from '../services/dbService.ts';

interface AdminPanelProps {
  user: User;
  files: FileResource[];
  onAddFile: (file: Omit<FileResource, 'id' | 'dateAdded'>) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  user,
  files, 
  onAddFile,
  onDeleteFile
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'system'>('files');
  const [copied, setCopied] = useState(false);
  const [connStatus, setConnStatus] = useState<{ loading: boolean; connected: boolean | null; message: string }>({
    loading: false, connected: null, message: 'Checking...'
  });

  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileCat, setFileCat] = useState<any>('Course');

  useEffect(() => { testDatabase(); }, []);

  const testDatabase = async () => {
    setConnStatus(prev => ({ ...prev, loading: true }));
    const result = await db.testConnection();
    setConnStatus({ loading: false, connected: result.success, message: result.message });
  };

  const sqlSchema = `-- --- HNS STUDENT COMPANION: REPAIR & MIGRATION SCRIPT ---
-- RUN THIS IN YOUR NEON SQL EDITOR IF YOU SEE ERRORS ABOUT MISSING COLUMNS

-- 1. FIX MISSING COLUMNS IN PROFILES (Migration)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_primary_admin BOOLEAN DEFAULT false;

-- 2. ENSURE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ENSURE TYPES (Enumerations)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_status') THEN
        CREATE TYPE study_status AS ENUM ('not-started', 'in-progress', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_category') THEN
        CREATE TYPE file_category AS ENUM ('Course', 'TD', 'Exam', 'Correction');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. RE-VALIDATE TABLE STRUCTURES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@hns-re2sd\\.dz$'),
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role user_role DEFAULT 'student',
  is_primary_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Chapter',
  status study_status DEFAULT 'not-started',
  exercises_solved INTEGER DEFAULT 0 CHECK (exercises_solved >= 0),
  total_exercises INTEGER DEFAULT 10 CHECK (total_exercises > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  progress_percent INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_exercises > 0 THEN LEAST(100, (exercises_solved * 100 / total_exercises)) ELSE 0 END
  ) STORED
);

CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  exercises_added INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category file_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  file_name TEXT,
  date_added DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  aspect_ratio TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_items_subject ON public.study_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_logs_item ON public.study_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_user ON public.visualizations(user_id);`;

  const handleAddFile = async () => {
    if (!fileTitle) return;
    await onAddFile({
      title: fileTitle,
      description: fileDesc,
      category: fileCat,
      tags: [],
      url: '#',
      fileName: 'document.pdf'
    });
    setFileTitle(''); setFileDesc('');
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-slate-500">Managing HNS Cloud Infrastructure.</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-bold shadow-sm transition-colors ${connStatus.connected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          <Database size={16} /> {connStatus.connected ? 'HNS CLOUD LINKED' : 'CLOUD OFFLINE'}
        </div>
      </header>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('files')} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'files' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>Library</button>
        <button onClick={() => setActiveTab('system')} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'system' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>System & Repair</button>
      </div>

      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-800">New Resource</h2>
              <input value={fileTitle} onChange={e => setFileTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Title" />
              <textarea value={fileDesc} onChange={e => setFileDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Description" />
              <select value={fileCat} onChange={e => setFileCat(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
                <option value="Course">Course</option><option value="TD">TD</option><option value="Exam">Exam</option><option value="Correction">Correction</option>
              </select>
              <button onClick={handleAddFile} disabled={!fileTitle} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 hover:bg-emerald-700 transition-colors">Upload to Neon Cloud</button>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 px-2">Manage Resources</h2>
            {files.length > 0 ? files.map(file => (
              <div key={file.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div>
                   <h3 className="font-bold text-slate-800">{file.title}</h3>
                   <p className="text-xs text-slate-400">{file.category} • Cloud Sync Active</p>
                </div>
                <button onClick={() => onDeleteFile(file.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            )) : (
              <div className="p-12 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-slate-400 font-medium">
                 No resources found in cloud storage.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="max-w-5xl space-y-8 animate-in slide-in-from-bottom-4">
          <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-start gap-4 shadow-sm">
             <AlertTriangle size={32} className="text-red-600 shrink-0" />
             <div className="space-y-2">
                <h3 className="font-bold text-red-800">Critical: Fix Column Errors</h3>
                <p className="text-sm text-red-700 leading-relaxed">
                  The errors you encountered ("column password_hash does not exist") mean your database is outdated. 
                  You <strong>MUST</strong> copy the SQL script below and run it in your <strong>Neon Console SQL Editor</strong>. 
                  This will safely add the missing columns without deleting your data.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-[40px] border border-slate-200 p-8 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                Database Link
              </h3>
              <div className={`p-6 rounded-[32px] border flex flex-col items-center gap-4 transition-colors ${connStatus.connected ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                {connStatus.loading ? <RefreshCw className="animate-spin text-slate-400" /> : <CloudLightning size={32} className={connStatus.connected ? 'text-emerald-500' : 'text-red-500'} />}
                <p className={`text-xs font-bold text-center ${connStatus.connected ? 'text-emerald-600' : 'text-red-600'}`}>{connStatus.message}</p>
              </div>
              <button onClick={testDatabase} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-colors">Test Connection Now</button>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Terminal size={20} className="text-slate-500" />
                  <h2 className="text-xl font-bold text-slate-800">Migration Script (Repair)</h2>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(sqlSchema); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                  className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copy Repair Script' : 'Copy Repair Script'}
                </button>
              </div>
              <div className="bg-slate-900 p-6 font-mono text-[10px] text-emerald-400 overflow-y-auto max-h-[350px] custom-scrollbar">
                <pre>{sqlSchema}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;