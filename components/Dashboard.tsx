
import React, { useState } from 'react';
import { Subject, StudyItem, StudyItemType } from '../types';
import { 
  Plus, BookOpen, Trash2, Layers, Zap, Target, X, ChevronRight, Activity, Sparkles
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
    <div className="space-y-12 pb-24">
      {/* Hero Statistics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 stagger-item" style={{ animationDelay: '0.1s' }}>
          <div className="bg-emerald-900 text-white rounded-[48px] p-12 relative overflow-hidden shadow-2xl group animate-shimmer">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
              <Zap size={240} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-800/50 rounded-full border border-emerald-700/50 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                <Activity size={12} /> System Status: Optimal
              </div>
              <h2 className="text-5xl font-poppins font-bold tracking-tight leading-tight max-w-xl">
                Fueling your <span className="text-emerald-400">academic transition</span> to green energy.
              </h2>
              <div className="pt-8 flex items-center gap-12">
                <div className="group/stat">
                  <div className="text-5xl font-bold group-hover/stat:text-emerald-400 transition-colors">{overallAvg}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mt-2">Overall Mastery</div>
                </div>
                <div className="w-px h-16 bg-white/10" />
                <div className="group/stat">
                  <div className="text-5xl font-bold group-hover/stat:text-emerald-400 transition-colors">{completedCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mt-2">Completed Units</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 stagger-item" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-xl shadow-slate-200/20 h-full flex flex-col justify-between group hover:border-emerald-200 transition-all">
            <div className="space-y-6">
               <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[32px] w-fit group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                 <Target size={36} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 leading-tight">Ready for a new module?</h3>
               <p className="text-slate-400 font-medium leading-relaxed">Expand your expertise by adding a specialized subject to your hub.</p>
            </div>
            <button 
              onClick={() => setShowAddSubject(true)}
              className="mt-8 w-full py-5 bg-slate-900 text-white font-bold rounded-[24px] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-200"
            >
              <Plus size={20} /> Register Subject
            </button>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-6 stagger-item" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
             <h2 className="text-2xl font-poppins font-bold text-slate-800">Learning Repository</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{subjects.length} Active Modules</span>
        </div>

        {subjects.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[64px] border-2 border-dashed border-slate-100 stagger-item" style={{ animationDelay: '0.4s' }}>
            <BookOpen size={80} className="mx-auto text-slate-100 mb-8 animate-float" />
            <h3 className="text-3xl font-bold text-slate-800">Your syllabus is clean</h3>
            <p className="text-slate-400 mt-3 font-medium max-w-sm mx-auto">Click "Register Subject" to begin tracking your renewable energy modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {subjects.map((subject, idx) => (
              <div 
                key={subject.id} 
                className="stagger-item glass-panel rounded-[56px] shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:translate-y-[-4px] group/card"
                style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
              >
                {/* Module Sidebar */}
                <div className="lg:w-96 bg-slate-50/50 p-12 border-r border-slate-100 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-100/50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">{subject.category}</span>
                    <h3 className="text-3xl font-bold text-slate-800 mt-4 leading-tight group-hover/card:text-emerald-800 transition-colors">{subject.name}</h3>
                  </div>
                  <div className="mt-12 flex items-center gap-4">
                    <button 
                      onClick={() => setAddingItemTo(subject.id)}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      <Plus size={16} /> Add Study Unit
                    </button>
                    <button onClick={() => onDeleteSubject(subject.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Units Area */}
                <div className="flex-1 p-12">
                  {subject.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                      <Layers size={48} className="mb-4 opacity-20 animate-pulse" />
                      <p className="text-sm font-medium">No active tasks for this module.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {subject.items.map((item, itemIdx) => (
                        <div key={item.id} className="p-8 bg-white rounded-[40px] border border-slate-50 group/item hover:bg-slate-50 transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button onClick={() => onDeleteItem(subject.id, item.id)} className="p-2 text-slate-200 hover:text-red-400 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-6">
                             <div className={`p-3 rounded-2xl ${item.progressPercent === 100 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <Sparkles size={18} />
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</div>
                                <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                             </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400 tracking-widest uppercase">SYNC LEVEL</span>
                              <span className="text-emerald-600">{item.progressPercent}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-right bg-emerald-400'}`} 
                                style={{ width: `${item.progressPercent}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals with enhanced animation */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[56px] p-12 shadow-2xl animate-in zoom-in-95 duration-500 border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Register Module</h2>
              <button onClick={() => setShowAddSubject(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              onAddSubject(d.get('name') as string, d.get('cat') as string);
              setShowAddSubject(false);
            }} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Subject Name</label>
                <input name="name" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-lg transition-all" placeholder="e.g., Wind Power Systems" required />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Academic Category</label>
                <input name="cat" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-lg transition-all" placeholder="e.g., Year 3 • Sem 1" required />
              </div>
              <button type="submit" className="w-full py-6 bg-emerald-600 text-white font-bold rounded-[32px] shadow-2xl hover:bg-emerald-700 transition-all text-xl active:scale-95">Register and Sync</button>
            </form>
          </div>
        </div>
      )}

      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[56px] p-12 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">New Study Unit</h2>
              <button onClick={() => setAddingItemTo(null)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={28} /></button>
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
            }} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Unit Title</label>
                <input name="title" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-lg transition-all" placeholder="e.g., Thermodynamics TD 1" required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Type</label>
                  <select name="type" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
                    <option value="Chapter">Chapter</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Task Count</label>
                  <input name="total" type="number" defaultValue="1" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg transition-all" required />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-emerald-600 text-white font-bold rounded-[32px] shadow-2xl hover:bg-emerald-700 transition-all text-xl active:scale-95">Deploy Unit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
