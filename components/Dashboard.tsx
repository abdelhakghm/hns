
import React, { useState } from 'react';
import { Subject, StudyItem, StudyItemType, User } from '../types';
import { 
  Plus, BookOpen, Trash2, Zap, Target, X, Radio, TrendingUp, Activity, CheckSquare, PlusCircle, Battery, Wind, Sun, ChevronRight, BarChart3, User as UserIcon
} from 'lucide-react';

interface DashboardProps {
  user: User;
  subjects: Subject[];
  onAddSubject: (name: string, category: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddItem: (subjectId: string, item: Omit<StudyItem, 'id' | 'logs' | 'progressPercent'>) => void;
  onDeleteItem: (subjectId: string, itemId: string) => void;
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, subjects, onAddSubject, onDeleteSubject, onAddItem, onDeleteItem, onUpdateItem
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  
  const [newSubName, setNewSubName] = useState('');
  const [newSubCat, setNewSubCat] = useState('Renewable Energy');

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<StudyItemType>('Chapter');
  const [newItemTotal, setNewItemTotal] = useState(5);

  const allItems = subjects.flatMap(s => s.items);
  const overallAvg = allItems.length > 0 ? Math.round(allItems.reduce((sum, i) => sum + i.progressPercent, 0) / allItems.length) : 0;
  const completedCount = allItems.filter(i => i.progressPercent === 100).length;

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;
    onAddSubject(newSubName, newSubCat);
    setNewSubName('');
    setShowAddSubject(false);
  };

  const handleAddItem = (e: React.FormEvent, subjectId: string) => {
    e.preventDefault();
    if (!newItemTitle) return;
    onAddItem(subjectId, {
      title: newItemTitle,
      type: newItemType,
      status: 'not-started',
      exercisesSolved: 0,
      totalExercises: newItemTotal
    });
    setNewItemTitle('');
    setAddingItemTo(null);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-12 animate-in fade-in duration-700">
      
      {/* Session Identity Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
             <UserIcon size={24} />
           </div>
           <div>
             <h4 className="text-white font-bold text-lg leading-tight">{user.name}</h4>
             <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Private Student Workspace</p>
           </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-slate-900/50 rounded-2xl border border-white/5">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Link Active</span>
        </div>
      </div>

      {/* Energy Monitor Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card rounded-[32px] md:rounded-[48px] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
              <Sun size={320} className="animate-spin-slow" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
              {/* Circular Load Indicator */}
              <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0 mx-auto md:mx-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                  <circle
                    cx="50%" cy="50%" r="42%" fill="none"
                    stroke={overallAvg > 75 ? '#10b981' : overallAvg > 30 ? '#34d399' : '#059669'} 
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * overallAvg / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl md:text-5xl font-poppins font-bold text-white flex items-start">
                    {overallAvg}<span className="text-lg mt-1">%</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Load Factor</span>
                </div>
              </div>

              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="px-4 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Radio size={12} className="animate-pulse" /> Grid Link: Active
                  </div>
                  <div className="px-4 py-1.5 bg-slate-900/40 border border-white/5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} /> Sync Stable
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-poppins font-bold text-white tracking-tight leading-tight">
                  Academic <span className="text-emerald-500 italic">Sync Hub</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto md:mx-0">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Units</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{allItems.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-500">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-[32px] border border-white/5 flex-1 flex flex-col justify-center text-center lg:text-left">
            <h3 className="font-bold text-white text-lg mb-2">Performance Vector</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Welcome back, {user.name.split(' ')[0]}. Your personal yield is at {overallAvg}%. All telemetry data is strictly isolated to your account.
            </p>
          </div>
          <button 
            onClick={() => setShowAddSubject(true)}
            className="w-full py-5 md:py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-[24px] md:rounded-[32px] shadow-2xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform" />
            Initialize Module
          </button>
        </div>
      </section>

      {/* Registry Grid */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl md:text-2xl font-poppins font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-emerald-500" size={24} /> Registry Nodes
          </h2>
          <div className="h-px bg-white/5 flex-1 mx-8 hidden lg:block" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{subjects.length} Units Online</span>
        </div>

        {subjects.length === 0 ? (
          <div className="glass-card rounded-[32px] p-16 md:p-24 text-center border-dashed border-white/10 opacity-60">
            <Zap size={40} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-lg font-bold text-slate-500">No Active Nodes</h3>
            <p className="text-xs text-slate-600 mt-2">Initialize your first module to begin tracking progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {subjects.map(subject => (
              <div key={subject.id} className="glass-card rounded-[32px] p-6 md:p-8 border-transparent hover:border-emerald-500/20 transition-all group/card flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{subject.category}</span>
                    <h3 className="text-lg font-bold text-white group-hover/card:text-emerald-400 transition-colors mt-0.5">{subject.name}</h3>
                  </div>
                  <button 
                    onClick={() => onDeleteSubject(subject.id)}
                    className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  {subject.items.map(item => (
                    <div key={item.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        <div>
                          <p className="text-[11px] font-bold text-white truncate max-w-[120px] md:max-w-none">{item.title}</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase">{item.type} • {item.progressPercent}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <button 
                           onClick={() => onUpdateItem(subject.id, item.id, { exercisesDelta: 1 })}
                           className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                         >
                           <PlusCircle size={14} />
                         </button>
                         <button 
                           onClick={() => onDeleteItem(subject.id, item.id)}
                           className="p-2 text-slate-800 hover:text-red-500 transition-all md:opacity-0 group-item-hover:opacity-100"
                         >
                           <X size={14} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setAddingItemTo(subject.id)}
                  className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:border-emerald-500/40 hover:text-emerald-500 transition-all active:scale-[0.98]"
                >
                  + Add Study Unit
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals remain the same... */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-card p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-emerald-500/20 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-white mb-6">Initialize Node</h2>
            <form onSubmit={handleAddSubject} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Module Name</label>
                <input 
                  autoFocus
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500"
                  placeholder="e.g. Photovoltaics I"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Discipline</label>
                <select 
                  value={newSubCat}
                  onChange={e => setNewSubCat(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none"
                >
                  <option>Renewable Energy</option>
                  <option>Electrical Eng</option>
                  <option>Soft Skills</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddSubject(false)} className="flex-1 py-4 text-slate-500 font-bold text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg">Link Core</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-card p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-emerald-500/20 shadow-2xl animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-white mb-6">New Registry</h2>
            <form onSubmit={(e) => handleAddItem(e, addingItemTo)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Unit Identity</label>
                <input 
                  autoFocus
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500"
                  placeholder="e.g. TD 01: Thermodynamic Cycle"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Type</label>
                  <select 
                    value={newItemType}
                    onChange={e => setNewItemType(e.target.value as StudyItemType)}
                    className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none"
                  >
                    <option value="Chapter">Chapter</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Load</label>
                  <input 
                    type="number"
                    value={newItemTotal}
                    onChange={e => setNewItemTotal(parseInt(e.target.value) || 1)}
                    className="w-full px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setAddingItemTo(null)} className="flex-1 py-4 text-slate-500 font-bold text-xs uppercase">Discard</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg">Commit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
