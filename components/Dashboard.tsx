
import React, { useState } from 'react';
import { Subject, StudyItem, StudyItemType } from '../types';
import { 
  Plus, BookOpen, Trash2, Zap, Target, X, Radio, TrendingUp, Activity
} from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  onAddSubject: (name: string, category: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddItem: (subjectId: string, item: Omit<StudyItem, 'id' | 'logs' | 'progressPercent'>) => void;
  onDeleteItem: (subjectId: string, itemId: string) => void;
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subjects, onAddSubject, onDeleteSubject, onAddItem, onDeleteItem 
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);

  const allItems = subjects.flatMap(s => s.items);
  const overallAvg = allItems.length > 0 ? Math.round(allItems.reduce((sum, i) => sum + i.progressPercent, 0) / allItems.length) : 0;
  const completedCount = allItems.filter(i => i.progressPercent === 100).length;

  return (
    <div className="space-y-10 pb-24">
      {/* Energy Monitor Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 stagger-item">
          <div className="glass-card rounded-[40px] p-10 md:p-14 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 rotate-12">
              <Zap size={200} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-12">
              {/* Thermal Efficiency Ring */}
              <div className="relative w-48 h-48 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="12" />
                  <circle
                    cx="50%" cy="50%" r="42%" fill="none"
                    stroke={overallAvg > 75 ? '#10b981' : overallAvg > 30 ? '#34d399' : '#059669'} 
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray="100 100"
                    strokeDashoffset={100 - overallAvg}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 10px ${overallAvg > 50 ? 'rgba(16, 185, 129, 0.4)' : 'transparent'})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-poppins font-bold text-white leading-none">{overallAvg}%</span>
                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Output</span>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                  <Radio size={12} className="animate-pulse" /> Neural Core: Online
                </div>
                <h2 className="text-4xl font-poppins font-bold text-white tracking-tighter leading-tight">
                  Academic <span className="text-emerald-500">Yield Sync</span>
                </h2>
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p>
                    <p className="text-2xl font-bold text-white">{allItems.length}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Goal Status</p>
                    <p className="text-2xl font-bold text-emerald-500">{completedCount} Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 stagger-item">
          <div className="glass-card rounded-[40px] p-10 flex flex-col justify-between border-emerald-500/10 hover:border-emerald-500/30 transition-all group h-full">
            <div className="space-y-6">
               <div className="p-4 bg-emerald-900/40 text-emerald-500 rounded-2xl w-fit">
                 <Target size={28} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">Deploy Module</h3>
               <p className="text-slate-500 text-sm leading-relaxed font-medium">Add a new academic module to your synchronization grid.</p>
            </div>
            <button 
              onClick={() => setShowAddSubject(true)}
              className="mt-8 w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
            >
              <Plus size={18} /> New Subject
            </button>
          </div>
        </div>
      </section>

      {/* Subject Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <TrendingUp className="text-emerald-500" size={20} />
             <h2 className="text-xl font-poppins font-bold text-white tracking-tight">Grid Overview</h2>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-[40px] border-dashed border-white/5">
            <BookOpen size={64} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-xl font-bold text-slate-400">Neutral Grid</h3>
            <p className="text-slate-600 text-sm mt-2">Initialize modules to begin academic energy tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className="glass-card rounded-[36px] p-8 transition-all hover:bg-white/[0.04] group/card border-emerald-500/5 hover:border-emerald-500/20 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest">{subject.category}</span>
                    <h3 className="text-lg font-bold text-white mt-3 leading-tight truncate">{subject.name}</h3>
                  </div>
                  <button onClick={() => onDeleteSubject(subject.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {subject.items.length === 0 ? (
                    <div className="py-4 text-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider italic">Grid empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subject.items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                           <div className={`w-1.5 h-1.5 rounded-full ${item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                           <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">{item.title}</p>
                           </div>
                           <span className="text-[9px] font-mono font-bold text-emerald-400">{item.progressPercent}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setAddingItemTo(subject.id)}
                  className="w-full py-3 bg-white/5 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mt-6"
                >
                  Link Unit
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals (Simplified for brevity as they were okay) */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-md rounded-[40px] p-10 border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Deploy Module</h2>
              <button onClick={() => setShowAddSubject(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onAddSubject(d.get('name') as string, d.get('cat') as string);
              setShowAddSubject(false);
            }} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Module Name</label>
                <input name="name" className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500" placeholder="e.g. Thermodynamics" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Category</label>
                <input name="cat" className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500" placeholder="e.g. Semester 3" required />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase text-xs tracking-widest">Initialize Node</button>
            </form>
          </div>
        </div>
      )}

      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="glass-card w-full max-w-md rounded-[40px] p-10 border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sync Learning Unit</h2>
              <button onClick={() => setAddingItemTo(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onAddItem(addingItemTo, {
                title: d.get('title') as string,
                type: d.get('type') as StudyItemType,
                status: 'not-started',
                exercisesSolved: 0,
                totalExercises: parseInt(d.get('total') as string) || 1
              });
              setAddingItemTo(null);
            }} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Unit Title</label>
                <input name="title" className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500" placeholder="e.g. Chapter 1: Introduction" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Type</label>
                  <select name="type" className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none text-xs font-bold appearance-none cursor-pointer">
                    <option value="Chapter">Chapter</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Exercises</label>
                  <input name="total" type="number" defaultValue="5" className="w-full px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white outline-none focus:border-emerald-500 font-medium" required />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase text-xs tracking-widest">Connect Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
