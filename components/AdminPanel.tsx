
import React, { useState, useRef } from 'react';
import { FileResource, User } from '../types';
import { Plus, Trash2, Edit3, Save, X, FilePlus, ChevronRight, Users, Shield, Mail, AlertTriangle, Lock, User as UserIcon, Tag, BookOpen, Search, Filter, Upload, File } from 'lucide-react';
import { DOMAIN_RESTRICTION, PRIMARY_ADMIN_EMAIL } from '../constants';

interface AdminPanelProps {
  user: User;
  subjects: any[]; 
  setSubjects: any;
  files: FileResource[];
  setFiles: React.Dispatch<React.SetStateAction<FileResource[]>>;
  adminEmails: string[];
  setAdminEmails: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  user,
  files, 
  setFiles,
  adminEmails,
  setAdminEmails
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'admins'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New File Form State
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fileCat, setFileCat] = useState<FileResource['category']>('Course');
  const [fileTags, setFileTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Admin management state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminError, setAdminError] = useState('');

  // Management State
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate title if empty
      if (!fileTitle) {
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        setFileTitle(nameWithoutExt);
      }
    }
  };

  const addFile = () => {
    if (!fileTitle) return;
    const newFile: FileResource = {
      id: Math.random().toString(36).substr(2, 9),
      title: fileTitle,
      description: fileDescription,
      category: fileCat,
      tags: fileTags.split(',').map(t => t.trim()).filter(t => t !== ''),
      url: '#', // In a real app, this would be the upload result URL
      dateAdded: new Date().toISOString().split('T')[0],
      fileName: selectedFile?.name || 'manual_entry.pdf'
    };
    setFiles([newFile, ...files]);
    setFileTitle('');
    setFileDescription('');
    setFileTags('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    if (confirm('Delete this academic resource from the repository? This action is permanent.')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const addAdmin = () => {
    setAdminError('');
    if (!newAdminEmail.endsWith(DOMAIN_RESTRICTION)) {
      setAdminError(`Admin must have an ${DOMAIN_RESTRICTION} email.`);
      return;
    }
    if (newAdminEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      setAdminError("This is already the primary administrator.");
      return;
    }
    if (adminEmails.includes(newAdminEmail.toLowerCase())) {
      setAdminError("This administrator is already registered.");
      return;
    }

    setAdminEmails([...adminEmails, newAdminEmail.toLowerCase()]);
    setNewAdminEmail('');
  };

  const removeAdmin = (email: string) => {
    if (confirm(`Remove administrative privileges for ${email}?`)) {
      setAdminEmails(adminEmails.filter(e => e !== email));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-poppins font-bold text-slate-800">Administrator Command Center</h1>
        <p className="text-slate-500">Manage the centralized Academic Repository and staff permissions.</p>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'files' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BookOpen size={18} />
          Repository (Files)
        </button>
        {user.isPrimary && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'admins' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={18} />
            Staff Management
          </button>
        )}
      </div>

      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add New File Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <FilePlus size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Add Resource</h2>
              </div>
              
              <div className="space-y-4">
                {/* File Upload Trigger */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Source File</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                  >
                    <Upload className="text-slate-400 group-hover:text-emerald-500" size={24} />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700">
                      {selectedFile ? 'Change File' : 'Browse PC or Phone'}
                    </span>
                  </button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <File className="text-emerald-600" size={16} />
                      <span className="text-xs font-bold text-emerald-700 truncate flex-1">{selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="text-emerald-400 hover:text-emerald-600">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resource Title</label>
                  <input
                    type="text"
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                    placeholder="e.g. PV Power Plants Final Exam"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-20 resize-none font-medium"
                    placeholder="Briefly explain what this file covers..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={fileCat}
                    onChange={(e) => setFileCat(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Course">Course</option>
                    <option value="TD">TD</option>
                    <option value="Exam">Exam</option>
                    <option value="Correction">Correction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tags (Comma separated)</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={fileTags}
                      onChange={(e) => setFileTags(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                      placeholder="Solar, Grid, 2024..."
                    />
                  </div>
                </div>

                <button
                  onClick={addFile}
                  disabled={!fileTitle || !selectedFile}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                >
                  Confirm Upload
                </button>
              </div>
            </div>
          </div>

          {/* Repository List Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <Search className="text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search repository..." 
                  className="w-full bg-transparent outline-none text-sm font-medium"
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
                  <Filter size={14} />
                  {files.length} Resources
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {files
                .filter(f => f.title.toLowerCase().includes(adminSearchTerm.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(adminSearchTerm.toLowerCase())))
                .map(file => (
                  <div key={file.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-start gap-5">
                      <div className={`p-4 rounded-2xl flex-shrink-0 ${
                        file.category === 'Exam' ? 'bg-orange-50 text-orange-600' :
                        file.category === 'Correction' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{file.category}</span>
                          <span className="text-[10px] font-bold text-slate-300">Added {file.dateAdded}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{file.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium italic">File: {file.fileName || 'document.pdf'}</p>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-1">{file.description || 'No description provided.'}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {file.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
              ))}
              {files.length === 0 && (
                <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px]">
                  <p className="text-slate-400 font-medium italic">Repository is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && user.isPrimary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-fit space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Add Admin</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  Administrators can manage the academic repository but cannot view personal student progress.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`user${DOMAIN_RESTRICTION}`}
                  />
                </div>
              </div>
              {adminError && <p className="text-xs text-red-500 font-bold px-1">{adminError}</p>}
              <button
                onClick={addAdmin}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Authorize Administrator
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Authorized Staff</h3>
            
            {/* Primary Admin Item */}
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Abdelhak Guehmam</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-widest">Primary Administrator</span>
                    <span className="text-xs text-slate-400">{PRIMARY_ADMIN_EMAIL}</span>
                  </div>
                </div>
              </div>
              <div className="p-2 text-slate-300">
                <Lock size={20} />
              </div>
            </div>

            {/* Secondary Admins */}
            <div className="space-y-3">
              {adminEmails.map(email => (
                <div key={email} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{email.split('@')[0]}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">Administrator</span>
                        <span className="text-xs text-slate-400">{email}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeAdmin(email)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
