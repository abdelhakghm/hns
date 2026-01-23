
import React, { useState, useEffect } from 'react';
import { Subject, StudyItem, StudyItemType, StudyLog } from '../types';
import { db } from '../services/dbService.ts';
import { 
  Plus, BookOpen, CheckCircle2, TrendingUp, GripVertical, Trash2, Edit, History, Layers, FileText, MoreVertical
} from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  onAddSubject: (name: string, category: string) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubject: (id: string, name: string, category: string) => void;
  onAddItem: (subjectId: string, item: Omit<StudyItem, 'id' | 'logs'>) => void;
  onDeleteItem: (subjectId: string, itemId: string) => void;
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem>) => void;
  onReorder: (newSubjects: Subject[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subjects, onAddSubject, onDeleteSubject, onUpdateSubject, onAddItem, onDeleteItem, onUpdateItem, onReorder 
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<StudyItem | null>(null);
  const [activeLogs, setActiveLogs] = useState<StudyLog[]>([]);

  useEffect(() => {
    if (viewingLogs) {
      db.getLogs(viewingLogs.id).then(setActiveLogs).catch(console.error);
    } else {
      setActiveLogs([]);
    }
  }, [viewingLogs]);

  const allItems = subjects.flatMap(s => s.items);
  const overallAvg = allItems.length > 0 ? Math.round(allItems.reduce((sum, i) => sum + i.progressPercent, 0) / allItems.length) : 0;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><h1 className="text-3xl font-poppins font-bold text-slate-800">My Study Progress</h1><p className="text-slate-500">Cloud-synced academic path tracking.</p></div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            <div><div className="text-xs text-slate-400 font-bold uppercase">Overall</div><div className="text-lg font-bold text-slate-800">{overallAvg}%</div></div>
          </div>
          <button onClick={() => setShowAddSubject(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">Add Subject</button>
        </div>
      </header>

      <div className="grid gap-8">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">{subject.category}</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{subject.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingSubject(subject.id)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><Edit size={18} /></button>
                <button onClick={() => onDeleteSubject(subject.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="bg-slate-50/30 p-8 pt-6">
              <div className="flex items-center justify-between mb-6 px-1">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Chapters</h4>
                <button onClick={() => setAddingItemTo(subject.id)} className="text-emerald-600 font-bold flex items-center gap-1.5"><Plus size={14} /> Add Item</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.items.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 group">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><FileText size={18} /></div>
                        <h5 className="text-sm font-bold text-slate-800">{item.title}</h5>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingLogs(item)} className="p-1.5 text-slate-400"><History size={16} /></button>
                        <button onClick={() => onDeleteItem(subject.id, item.id)} className="p-1.5 text-slate-400"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${item.progressPercent}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {viewingLogs && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 space-y-6 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-start">
              <div><h2 className="text-2xl font-bold">Activity History</h2><p className="text-slate-500">{viewingLogs.title}</p></div>
              <button onClick={() => setViewingLogs(null)} className="p-2"><MoreVertical size={20} className="rotate-90" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {activeLogs.length > 0 ? activeLogs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between mb-1"><span className="text-xs font-bold text-slate-400">{log.timestamp}</span>{log.exercisesAdded > 0 && <span className="text-[10px] text-emerald-600 font-bold">+{log.exercisesAdded} Ex</span>}</div>
                  <p className="text-sm text-slate-700">{log.note}</p>
                </div>
              )) : <p className="text-center py-12 text-slate-400 italic">No cloud logs found.</p>}
            </div>
            <button onClick={() => setViewingLogs(null)} className="w-full py-4 bg-slate-100 font-bold rounded-2xl">Close</button>
          </div>
        </div>
      )}

      {/* Add Subject Modal Placeholder */}
      {(showAddSubject) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-6">
            <h2 className="text-2xl font-bold">New Subject</h2>
            <form onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); onAddSubject(d.get('name') as string, d.get('cat') as string); setShowAddSubject(false); }} className="space-y-4">
              <input name="name" placeholder="Name" className="w-full px-5 py-3 bg-slate-50 border rounded-2xl" required />
              <input name="cat" placeholder="Category" className="w-full px-5 py-3 bg-slate-50 border rounded-2xl" required />
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl">Create Cloud Entry</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal Placeholder */}
      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-6">
            <h2 className="text-2xl font-bold">New Item</h2>
            <form onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); onAddItem(addingItemTo, { title: d.get('title') as string, type: 'Chapter', status: 'not-started', exercisesSolved: 0, totalExercises: 10, progressPercent: 0 }); setAddingItemTo(null); }} className="space-y-4">
              <input name="title" placeholder="Title" className="w-full px-5 py-3 bg-slate-50 border rounded-2xl" required />
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl">Add Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
