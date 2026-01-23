
import React, { useState } from 'react';
import { Subject, StudyItem, StudyItemType, StudyStatus } from '../types';
import { 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  GripVertical, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ChevronDown, 
  History,
  Info,
  Layers,
  FileText,
  Activity
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
  subjects, 
  onAddSubject, 
  onDeleteSubject, 
  onUpdateSubject, 
  onAddItem, 
  onDeleteItem, 
  onUpdateItem,
  onReorder 
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<StudyItem | null>(null);

  // Overall Stats based on total progress average across all subjects
  const allItems = subjects.flatMap(s => s.items);
  const totalItemsCount = allItems.length;
  const overallAvg = totalItemsCount > 0 
    ? Math.round(allItems.reduce((sum, item) => sum + item.progressPercent, 0) / totalItemsCount) 
    : 0;

  const statusColors = {
    'not-started': 'bg-slate-100 text-slate-500 border-slate-200',
    'in-progress': 'bg-amber-50 text-amber-600 border-amber-200',
    'completed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newSubjects = [...subjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSubjects.length) {
      [newSubjects[index], newSubjects[targetIndex]] = [newSubjects[targetIndex], newSubjects[index]];
      onReorder(newSubjects);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800">My Study Progress</h1>
          <p className="text-slate-500">Customize your academic path and track your personal growth.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Progress</div>
              <div className="text-lg font-bold text-slate-800">{overallAvg}%</div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddSubject(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>
      </header>

      {/* Grid of Subjects */}
      <div className="grid gap-8">
        {subjects.map((subject, index) => {
          // Calculate subject-level progress as average of its items
          const itemsCount = subject.items.length;
          const subjectProgress = itemsCount > 0 
            ? Math.round(subject.items.reduce((sum, item) => sum + item.progressPercent, 0) / itemsCount) 
            : 0;
          const itemsMastered = subject.items.filter(i => i.status === 'completed').length;
          
          return (
            <div key={subject.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              {/* Subject Header */}
              <div className="p-8 border-b border-slate-50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-emerald-500 disabled:opacity-30"><GripVertical size={20} className="rotate-90" /></button>
                      <button onClick={() => handleMove(index, 'down')} disabled={index === subjects.length - 1} className="text-slate-300 hover:text-emerald-500 disabled:opacity-30"><GripVertical size={20} className="rotate-90" /></button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">{subject.category}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-widest">{subject.items.length} Items</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mt-1">{subject.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingSubject(subject.id)}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteSubject(subject.id)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                    style={{ width: `${subjectProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
                  <span>{subjectProgress}% Academic completion</span>
                  <span>{itemsMastered} / {itemsCount} mastered</span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-50/30 p-8 pt-6">
                <div className="flex items-center justify-between mb-6 px-1">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} />
                    Chapters & Tutorials
                  </h4>
                  <button 
                    onClick={() => setAddingItemTo(subject.id)}
                    className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subject.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            item.type === 'Chapter' ? 'bg-blue-50 text-blue-500' :
                            item.type === 'TD' ? 'bg-purple-50 text-purple-500' :
                            'bg-orange-50 text-orange-500'
                          }`}>
                            {item.type === 'Chapter' ? <BookOpen size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-medium">{item.type}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColors[item.status]}`}>
                                {item.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setViewingLogs(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-500"
                            title="View History"
                          >
                            <History size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteItem(subject.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Solved: {item.exercisesSolved} / {item.totalExercises}</span>
                            <span>{item.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                item.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                           <button 
                            onClick={() => onUpdateItem(subject.id, item.id, { 
                              status: item.status === 'completed' ? 'in-progress' : 'completed',
                              exercisesSolved: item.status === 'completed' ? 0 : item.totalExercises 
                            })}
                            className={`p-2 rounded-xl transition-all ${
                              item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300 hover:bg-slate-50'
                            }`}
                            title={item.status === 'completed' ? "Mark Incomplete" : "Mark Completed"}
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {subject.items.length === 0 && (
                    <div className="col-span-2 py-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-400 font-medium">No chapters added yet. Start by adding your first study material!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm max-w-2xl mx-auto">
          <div className="inline-flex p-6 bg-emerald-50 text-emerald-600 rounded-full mb-6">
            <BookOpen size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Your study board is empty</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Create your first subject to start tracking your renewable energy education journey.</p>
          <button 
            onClick={() => setShowAddSubject(true)}
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold transition-all"
          >
            Create Subject Now
          </button>
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      {(showAddSubject || editingSubject) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800">{editingSubject ? 'Edit Subject' : 'New Subject'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              if (editingSubject) {
                onUpdateSubject(editingSubject, name, category);
              } else {
                onAddSubject(name, category);
              }
              setShowAddSubject(false);
              setEditingSubject(null);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Name</label>
                <input 
                  name="name" 
                  defaultValue={editingSubject ? subjects.find(s => s.id === editingSubject)?.name : ''}
                  required 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Solar Photovoltaics"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                <input 
                  name="category" 
                  defaultValue={editingSubject ? subjects.find(s => s.id === editingSubject)?.category : ''}
                  required 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Energy Systems"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setShowAddSubject(false); setEditingSubject(null); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  {editingSubject ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addingItemTo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800">New Material</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onAddItem(addingItemTo, {
                title: formData.get('title') as string,
                type: formData.get('type') as StudyItemType,
                status: 'not-started',
                exercisesSolved: 0,
                totalExercises: Number(formData.get('total')) || 10,
                progressPercent: 0,
              });
              setAddingItemTo(null);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                <input name="title" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Tutorial 1: Energy Yield" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
                  <select name="type" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Chapter">Chapter</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Exercises</label>
                  <input name="total" type="number" defaultValue="10" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setAddingItemTo(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Logs Modal */}
      {viewingLogs && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Activity History</h2>
                <p className="text-slate-500 text-sm mt-1">{viewingLogs.title}</p>
              </div>
              <button onClick={() => setViewingLogs(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><MoreVertical size={20} className="rotate-90" /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {viewingLogs.logs.length > 0 ? viewingLogs.logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-400">{log.timestamp}</span>
                    {log.exercisesAdded && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded-full">+{log.exercisesAdded} Ex</span>}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{log.note}</p>
                </div>
              )).reverse() : (
                <div className="text-center py-12 text-slate-400 italic">No activity recorded for this material yet.</div>
              )}
            </div>
            <button 
              onClick={() => setViewingLogs(null)}
              className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
