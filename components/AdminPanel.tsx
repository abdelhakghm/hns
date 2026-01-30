
import React, { useState, useEffect } from 'react';
import { FileResource, User } from '../types';
import { 
  Trash2, Database, FileUp, List, Link as LinkIcon, FileText, Loader2, ShieldCheck
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
  const [connStatus, setConnStatus] = useState<{ connected: boolean | null; message: string }>({
    connected: null, message: 'Checking status...'
  });

  // Files Form State
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileCat, setFileCat] = useState<'Course' | 'TD' | 'Exam' | 'Correction'>('Course');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { 
    const checkConnection = async () => {
      const result = await db.testConnection();
      setConnStatus({ connected: result.success, message: result.message });
    };
    checkConnection();
  }, []);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle || !fileUrl) return;
    
    setIsUploading(true);
    try {
      await onAddFile({
        title: fileTitle,
        description: fileDesc,
        category: fileCat,
        tags: [],
        url: fileUrl,
        fileName: fileName || 'academic_resource.pdf'
      });
      setFileTitle(''); setFileDesc(''); setFileUrl(''); setFileName('');
    } catch (e) {
      console.error("Upload failed:", e);
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-poppins font-bold text-slate-100 tracking-tight flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" size={36} />
            Admin Console
          </h1>
          <p className="text-slate-500 font-medium">Global Library Management & Resource Control</p>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 text-xs font-bold shadow-sm transition-all ${connStatus.connected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          <Database size={16} /> 
          {connStatus.connected ? 'CLOUD CONNECTED' : 'OFFLINE MODE'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Resource Editor Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-10 rounded-[48px] border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-600 rounded-2xl text-white"><FileUp size={24} /></div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Resource Editor</h2>
            </div>
            
            <form onSubmit={handleCreateFile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Module Title</label>
                <input 
                  value={fileTitle} 
                  onChange={e => setFileTitle(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="e.g., Intro to Photovoltaics" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Brief Details</label>
                <textarea 
                  value={fileDesc} 
                  onChange={e => setFileDesc(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500 h-28 resize-none transition-all" 
                  placeholder="What is in this file?" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Type</label>
                  <select 
                    value={fileCat} 
                    onChange={e => setFileCat(e.target.value as any)} 
                    className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none font-bold text-sm appearance-none"
                  >
                    <option value="Course">Course</option>
                    <option value="TD">TD</option>
                    <option value="Exam">Exam</option>
                    <option value="Correction">Correction</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">File Tag</label>
                  <input 
                    value={fileName} 
                    onChange={e => setFileName(e.target.value)} 
                    className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none" 
                    placeholder="Filename" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <LinkIcon size={12} /> Resource URL (Google Drive/PDF)
                </label>
                <input 
                  value={fileUrl} 
                  onChange={e => setFileUrl(e.target.value)} 
                  className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all" 
                  placeholder="https://..." 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isUploading || !fileTitle || !fileUrl} 
                className="w-full py-5 bg-emerald-600 text-white font-bold rounded-[24px] shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Database size={20} />}
                Add to Global Library
              </button>
            </form>
          </div>
        </div>
        
        {/* Active Registry List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <List size={22} className="text-emerald-500" /> Library Registry
            </h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{files.length} Resources Online</span>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {files.length > 0 ? files.map(file => (
              <div key={file.id} className="glass-card p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-slate-900/60 text-slate-400 rounded-[20px] group-hover:text-emerald-500 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{file.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded">{file.category}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{file.dateAdded}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteFile(file.id)} 
                  className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                  title="Remove from Library"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )) : (
              <div className="p-24 text-center glass-card rounded-[48px] border-dashed border-white/10 opacity-50">
                <Database size={32} className="mx-auto text-slate-800 mb-6" />
                <h3 className="text-lg font-bold text-slate-600">Registry Empty</h3>
                <p className="text-sm text-slate-700 mt-2 font-medium">Add files to populate the student library.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
