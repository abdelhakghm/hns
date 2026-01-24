
import React, { useState, useEffect } from 'react';
import { FileResource, User } from '../types';
import { 
  Trash2, Database, Terminal, 
  Copy, Check, CloudLightning, RefreshCw, 
  Settings2, Activity, ShieldAlert, AlertTriangle, UserPlus, ShieldCheck, FileUp, List, Link as LinkIcon, FileText, Info, Loader2
} from 'lucide-react';
import { db } from '../services/dbService.ts';
import { PRIMARY_ADMIN_EMAIL } from '../constants.ts';

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
  const [activeTab, setActiveTab] = useState<'files' | 'admins' | 'system'>('files');
  const [copied, setCopied] = useState(false);
  const [connStatus, setConnStatus] = useState<{ loading: boolean; connected: boolean | null; message: string }>({
    loading: false, connected: null, message: 'Checking...'
  });

  const isPrimary = user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  // Files Tab State
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileCat, setFileCat] = useState<any>('Course');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Admins Tab State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  useEffect(() => { 
    testDatabase(); 
    if (activeTab === 'admins') loadAdmins();
  }, [activeTab]);

  const testDatabase = async () => {
    setConnStatus(prev => ({ ...prev, loading: true }));
    const result = await db.testConnection();
    setConnStatus({ loading: false, connected: result.success, message: result.message });
  };

  const loadAdmins = async () => {
    try {
      const list = await db.getAllAdmins();
      setAdminsList(list);
    } catch (e) {}
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    if (!isPrimary) return;

    try {
      await db.addAdminByEmail(adminEmail);
      setAdminSuccess(`Successfully promoted ${adminEmail} to Admin.`);
      setAdminEmail('');
      loadAdmins();
    } catch (err: any) {
      setAdminError(err.message || 'Could not find user or promote them.');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!isPrimary || userId === user.id) return;
    try {
      await db.removeAdminStatus(userId);
      loadAdmins();
    } catch (e) {}
  };

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
    } catch (e) {}
    setIsUploading(false);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-poppins font-bold text-slate-800 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 font-medium">HNS Academic Infrastructure Management</p>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 text-xs font-bold shadow-sm transition-all ${connStatus.connected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          <Database size={16} /> 
          {connStatus.connected ? 'CLOUD SYNC ACTIVE' : 'CLOUD OFFLINE'}
        </div>
      </header>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[24px] w-fit shadow-inner">
        <button onClick={() => setActiveTab('files')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'files' ? 'bg-white text-emerald-700 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800'}`}>
          <FileUp size={18} /> Library
        </button>
        <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'admins' ? 'bg-white text-emerald-700 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800'}`}>
          <ShieldCheck size={18} /> Admins
        </button>
        <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === 'system' ? 'bg-white text-emerald-700 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800'}`}>
          <Settings2 size={18} /> Diagnostics
        </button>
      </div>

      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FileUp size={24} /></div>
                <h2 className="text-2xl font-bold text-slate-800">Add Academic File</h2>
              </div>
              
              <form onSubmit={handleCreateFile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                  <input value={fileTitle} onChange={e => setFileTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Intro to Photovoltaics" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Description</label>
                  <textarea value={fileDesc} onChange={e => setFileDesc(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 h-28 resize-none" placeholder="Brief details about the content..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Category</label>
                    <select value={fileCat} onChange={e => setFileCat(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold">
                      <option value="Course">Course</option><option value="TD">TD</option><option value="Exam">Exam</option><option value="Correction">Correction</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Display Name</label>
                    <input value={fileName} onChange={e => setFileName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="file_name.pdf" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-2"><LinkIcon size={12} /> File Link / URL</label>
                  <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Paste link (Drive, PDF host, etc)" required />
                </div>
                
                <button type="submit" disabled={isUploading || !fileTitle || !fileUrl} className="w-full py-5 bg-slate-900 text-white font-bold rounded-[24px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {isUploading ? <Loader2 className="animate-spin" /> : <Database size={20} />}
                  Publish to Repository
                </button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <List size={22} className="text-emerald-600" /> Current Resources
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{files.length} Items</span>
            </div>
            
            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
              {files.length > 0 ? files.map(file => (
                <div key={file.id} className="bg-white p-6 rounded-[32px] border border-slate-50 flex items-center justify-between group hover:shadow-lg hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-[20px] group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{file.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded">{file.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{file.dateAdded}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onDeleteFile(file.id)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              )) : (
                <div className="p-24 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Use the form to upload your first academic resource.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[36px] flex items-start gap-5 shadow-sm">
            <div className="p-4 bg-white rounded-3xl text-emerald-600 shadow-sm"><ShieldAlert size={32} /></div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-emerald-900">Privileged Access Management</h3>
              <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                Admins have permissions to add/delete resources in the Library. 
                {isPrimary ? ' Only you can grant or revoke these privileges.' : ' Only the Primary Admin can manage administrative roles.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {isPrimary && (
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <UserPlus size={24} className="text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Promote Admin</h2>
                </div>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Institutional Email</label>
                    <input 
                      value={adminEmail} 
                      onChange={e => setAdminEmail(e.target.value)} 
                      placeholder="user@hns-re2sd.dz" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" 
                      required 
                    />
                  </div>
                  {adminError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {adminError}</div>}
                  {adminSuccess && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold border border-emerald-100 flex items-center gap-2"><Check size={14} /> {adminSuccess}</div>}
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-[20px] shadow-lg hover:bg-emerald-700 transition-all">Grant Admin Rights</button>
                </form>
              </div>
            )}

            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-600" /> Active Staff
              </h2>
              <div className="space-y-3">
                {adminsList.map(adm => (
                  <div key={adm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {adm.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">{adm.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{adm.email}</p>
                      </div>
                    </div>
                    {isPrimary && adm.email && adm.email.toLowerCase() !== PRIMARY_ADMIN_EMAIL.toLowerCase() && (
                      <button onClick={() => handleRemoveAdmin(adm.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <Activity size={32} className="text-emerald-500" />
              <h2 className="text-2xl font-bold text-slate-800">System Diagnostics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-8 rounded-[40px] border flex flex-col items-center text-center gap-4 ${connStatus.connected ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <CloudLightning size={48} className={connStatus.connected ? 'text-emerald-500' : 'text-red-500'} />
                <div>
                  <h4 className="font-bold text-slate-800">Cloud Link Status</h4>
                  <p className="text-xs font-bold mt-1 text-slate-500 uppercase tracking-widest">{connStatus.message}</p>
                </div>
                <button onClick={testDatabase} className="mt-4 px-6 py-2.5 bg-white border border-slate-100 text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all">Retry Link</button>
              </div>

              <div className="p-8 rounded-[40px] border border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <Info size={20} className="text-emerald-500" />
                  <h4 className="font-bold">Security Notes</h4>
                </div>
                <ul className="text-xs text-slate-500 font-medium space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> Local Mode uses IndexedDB fallback.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> Passwords hashed via PBKDF2 iterations.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> RLS Policies active on Supabase tables.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
