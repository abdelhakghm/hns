
import React, { useState } from 'react';
import { Task } from '../types';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  X, 
  Check,
  ListTodo,
  Calendar
} from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onEditTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = () => {
    if (editingId && editingTitle.trim()) {
      onEditTask(editingId, editingTitle.trim());
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <ListTodo size={14} />
            Mission Registry
          </h2>
          <h1 className="text-3xl font-poppins font-bold text-white tracking-tight">Daily Objectives</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/40 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completion</p>
            <p className="text-lg font-mono font-bold text-emerald-400">{progressPercent}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/5"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                className="text-emerald-500 transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-white">{completedCount}/{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden focus-within:border-emerald-500/50 transition-all">
          <div className="pl-6 text-slate-500">
            <Plus size={20} />
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Initialize new objective..."
            className="w-full px-4 py-5 bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-8 py-5 bg-emerald-600/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-0"
          >
            Deploy
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/5 rounded-[32px]">
            <ListTodo size={40} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">No active objectives in registry</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className={`group relative glass-card rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4 p-4 md:p-5">
                <button
                  onClick={() => onToggleTask(task.id, !task.completed)}
                  className={`flex-shrink-0 transition-all duration-300 ${
                    task.completed ? 'text-emerald-500 scale-110' : 'text-slate-600 hover:text-emerald-400'
                  }`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="w-full bg-slate-800/50 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <button onClick={saveEdit} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 text-slate-500 hover:bg-white/5 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium transition-all duration-500 truncate ${
                        task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                          <Calendar size={10} />
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        {task.completed && (
                          <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest">
                            Objective Secured
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(task)}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-8 flex items-center justify-center gap-3 opacity-20">
        <div className="h-[1px] w-12 bg-slate-500" />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">HNS Registry Protocol v1.0</span>
        <div className="h-[1px] w-12 bg-slate-500" />
      </div>
    </div>
  );
};

export default TodoList;
