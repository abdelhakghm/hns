
import React, { useState, useEffect } from 'react';
import { Subject, StudyItem, StudyItemType, StudyLog } from '../types';
import { db } from '../services/dbService.ts';
import { 
  Plus, BookOpen, CheckCircle2, TrendingUp, Trash2, Edit, History, Layers, FileText, X, Settings2
} from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  onAddSubject: (name: string, category: string) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubject: (id: string, name: string, category: string) => void;
  onAddItem: (subjectId: string, item: Omit<StudyItem, 'id' | 'logs' | 'progressPercent'>) => void;
  onDeleteItem: (subjectId: string, itemId: string) => void;
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem>) => void;
  onReorder: (newSubjects: Subject[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subjects, onAddSubject, onDeleteSubject, onAddItem, onDeleteItem, onUpdateItem 
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<StudyItem | null>(null);
  const [activeLogs, setActiveLogs] = useState<any[]>([]);

  // New item form state
  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState<StudyItemType>('Chapter');
  const [itemTotal, setItemTotal] = useState(5);

  useEffect(() => {
    if (viewingLogs) {
      db.getLogs(viewingLogs.id).then(setActiveLogs).catch(console.error);
    }
  }, [viewingLogs]);

  const allItems = subjects.flatMap(s => s.items);
  const overallAvg = allItems.length > 0 ? Math.round(allItems.reduce((sum, i) => sum + i.progressPercent, 0) / allItems.length) : 0;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingItemTo || !itemTitle) return;
    
    onAddItem(addingItemTo, {
      title: itemTitle,
      type: itemType,
      status: 'not-started',
      exercisesSolved: 0,
      totalExercises: itemTotal
    });
    
    setAddingItemTo(null);
    setItemTitle('');
    setItemType('Chapter');
    setItemTotal(5);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800">Study Progress</h1>
          <p className="text-slate-500">Track your chapters, TDs, and TPs in one place.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Average</div>
              <div className="text-lg font-bold text-slate-800">{overallAvg}%</div>
            </div>
          </div>
          <button onClick={() => setShowAddSubject(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Plus size={20} /> Add Subject
          </button>
        </div>
      </header>

      {subjects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No subjects added yet</h3>
          <p className="text-slate-400 mt-2">Start by adding your first academic module.</p>
          <button onClick={() => setShowAddSubject(true)} className="mt-6 text-emerald-600 font-bold hover:underline">Add Subject Now</button>
        </div>
      ) : (
        <div className="grid gap-8">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{subject.category}</span>
                  <h3 className="text-2xl font-bold text-slate-800 mt-2">{subject.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onDeleteSubject(subject.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={16} /> Elements & Tasks
                  </h4>
                  <button onClick={() => setAddingItemTo(subject.id)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-2">
                    <Plus size={14} /> Add Task Element
                  </button>
                </div>

                {subject.items.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm font-medium italic">No Chapters, TDs or TPs listed for this subject.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subject.items.map(item => (
                      <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded w-fit ${
                              item.type === 'Chapter' ? 'bg-blue-50 text-blue-600' : 
                              item.type === 'TD' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {item.type}
                            </span>
                            <h5 className="text-sm font-bold text-slate-800 leading-tight">{item.title}</h5>
                          </div>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => setViewingLogs(item)} className="p-1.5 text-slate-400 hover:text-emerald-600"><History size={16} /></button>
                            <button onClick={() => onDeleteItem(subject.id, item.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Progress</span>
                          <span className="text-xs font-bold text-slate-800">{item.exercisesSolved}/{item.totalExercises} Done</span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`} 
                            style={{ width: `${item.progressPercent}%` }} 
                          />
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

      {/* Item Modal */}
      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Task Element</h2>
              <button onClick={() => setAddingItemTo(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                <input 
                  value={itemTitle} 
                  onChange={e => setItemTitle(e.target.value)} 
                  placeholder="e.g., Solar Cells Efficiency" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Type</label>
                  <select 
                    value={itemType} 
                    onChange={e => setItemType(e.target.value as StudyItemType)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                  >
                    <option value="Chapter">Chapter</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Total Tasks</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={itemTotal} 
                    onChange={e => setItemTotal(parseInt(e.target.value))} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all mt-4">Create Element</button>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {viewingLogs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Activity History</h2>
                <p className="text-emerald-600 font-bold text-sm mt-1">{viewingLogs.title}</p>
              </div>
              <button onClick={() => setViewingLogs(null)} className="p-2 text-slate-300 hover:bg-slate-50 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
              {activeLogs.length > 0 ? activeLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-200" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.timestamp}</span>
                    {log.exercises_added > 0 && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-lg">+{log.exercises_added} Tasks</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{log.note}</p>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <History size={48} className="text-slate-200" />
                  <p className="text-slate-400 italic">No activity logs recorded yet for this item.</p>
                </div>
              )}
            </div>
            <button onClick={() => setViewingLogs(null)} className="w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-2xl mt-8 hover:bg-slate-200 transition-all">Close History</button>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Academic Subject</h2>
              <button onClick={() => setShowAddSubject(false)} className="p-2 text-slate-300 hover:bg-slate-50 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={e => { 
              e.preventDefault(); 
              const d = new FormData(e.currentTarget); 
              onAddSubject(d.get('name') as string, d.get('cat') as string); 
              setShowAddSubject(false); 
            }} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Subject Name</label>
                <input name="name" placeholder="e.g., Renewable Energy Systems" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                <input name="cat" placeholder="e.g., Solar Power, Year 3" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all mt-4">Register Subject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
