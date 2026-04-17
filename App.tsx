
import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import GradesCalculator from './components/GradesCalculator.tsx';
import TodoList from './components/TodoList.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog, StudyStatus, Task, StudySession } from './types.ts';
import { db } from './services/dbService.ts';
import { Loader2, RefreshCw } from 'lucide-react';

const GUEST_USER: User = {
  id: 'guest_scholar',
  name: 'Scholar'
};

const App: React.FC = () => {
  const [user] = useState<User>(GUEST_USER);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('todo');

  React.useEffect(() => {
    loadAppData(user.id).finally(() => setIsLoading(false));
  }, []);

  const loadAppData = async (userId: string) => {
    try {
      const [subjects, files, tasks, studySessions] = await Promise.all([
        db.getSubjects(userId),
        db.getFiles(),
        db.getTasks(userId),
        db.getStudySessions(userId)
      ]);
      setSubjects(subjects);
      setFiles(files);
      setTasks(tasks);
      setSessions(studySessions);
    } catch (e) {
      console.error("Local data load failed:", e);
    }
  };

  const addSubject = async (name: string, category: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const id = await db.createSubject(user.id, name, category);
      if (id) {
        setSubjects(prev => [{ id, name, category, items: [] }, ...prev]);
      }
    } catch (e) {
      console.error("Subject creation failed:", e);
    }
    setIsSyncing(false);
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await db.deleteSubject(user.id, id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (e) {}
    setIsSyncing(false);
  };

  const addItemToSubject = async (subjectId: string, item: Omit<StudyItem, 'id' | 'logs' | 'progressPercent'>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const id = await db.createItem(user.id, subjectId, item);
      if (id) {
        const solved = item.exercisesSolved || 0;
        const total = Math.max(1, item.totalExercises || 1);
        const progressPercent = Math.round((solved / total) * 100);
        // Explicitly type the status to avoid inference as generic string
        const status: StudyStatus = progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in-progress' : 'not-started';
        
        setSubjects(prev => prev.map(s => {
          if (s.id !== subjectId) return s;
          const newItem: StudyItem = {
            ...item,
            id,
            status,
            logs: [],
            progressPercent
          };
          return { ...s, items: [...s.items, newItem] };
        }));
      }
    } catch (e: any) {
      console.error("Study Unit creation failed in HNS Hub:", e);
    }
    setIsSyncing(false);
  };

  const deleteItem = async (subjectId: string, itemId: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await db.deleteItem(user.id, itemId);
      setSubjects(prev => prev.map(s => (s.id === subjectId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)));
    } catch (e) {}
    setIsSyncing(false);
  };

  const updateItem = async (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => {
    if (!user) return;
    
    const subject = subjects.find(s => s.id === subjectId);
    const item = subject?.items.find(i => i.id === itemId);
    if (!item) return;

    let solved = updates.exercisesSolved !== undefined ? updates.exercisesSolved : item.exercisesSolved;
    if (updates.exercisesDelta) solved += updates.exercisesDelta;
    
    const total = updates.totalExercises !== undefined ? updates.totalExercises : item.totalExercises;
    solved = Math.max(0, Math.min(solved, total));
    
    const percent = Math.round((solved / Math.max(1, total)) * 100);
    // Explicitly type the status to avoid inference as generic string
    const status: StudyStatus = percent === 100 ? 'completed' : percent > 0 ? 'in-progress' : 'not-started';

    const finalUpdate = { 
      exercisesSolved: solved, 
      totalExercises: total, 
      progressPercent: percent, 
      status 
    };

    // Optimistic Update
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        items: s.items.map(i => (i.id === itemId ? { ...i, ...finalUpdate } : i))
      };
    }));

    try {
      await db.updateItem(user.id, itemId, finalUpdate);
      if (logEntry) {
        await db.createLog(user.id, itemId, logEntry);
      }
    } catch (e) {
      console.error("Progress save failed on cloud node:", e);
      // Re-fetch data on failure to ensure UI consistency
      loadAppData(user.id);
    }
  };

  const onAddFile = async (file: Omit<FileResource, 'id' | 'dateAdded'>) => {
    try {
      const newFile = await db.createFile(file);
      setFiles(prev => [newFile, ...prev]);
    } catch (e) {}
  };

  const onDeleteFile = async (id: string) => {
    try {
      await db.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {}
  };

  const addTask = async (title: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const newTask = await db.createTask(user.id, title);
      setTasks(prev => [newTask, ...prev]);
    } catch (e) {}
    setIsSyncing(false);
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (!user) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    try {
      await db.updateTask(user.id, id, { completed });
    } catch (e) {
      loadAppData(user.id);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await db.deleteTask(user.id, id);
    } catch (e) {
      loadAppData(user.id);
    }
  };

  const editTask = async (id: string, title: string) => {
    if (!user) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    try {
      await db.updateTask(user.id, id, { title });
    } catch (e) {
      loadAppData(user.id);
    }
  };

  const logSession = async (subjectId: string | null, durationSeconds: number) => {
    if (!user) return;
    try {
      const newSession = await db.createStudySession(user.id, subjectId, durationSeconds);
      setSessions(prev => [newSession, ...prev]);
    } catch (e) {
      console.error("Session logging failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="text-emerald-500 animate-spin relative" size={48} />
        </div>
        <p className="mt-8 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Initializing HNS Hub</p>
      </div>
    );
  }

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView}>
      {isSyncing && (
        <div className="fixed top-8 right-8 z-[200] flex items-center gap-3 bg-emerald-600 px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
          <RefreshCw size={14} className="text-white animate-spin" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">HNS Syncing...</span>
        </div>
      )}

      {currentView === 'grades' && (
        <GradesCalculator userId={user.id} />
      )}
      {currentView === 'library' && (
        <Library subjects={subjects} files={files} user={user} />
      )}
      {currentView === 'focus' && (
        <StudyTimer subjects={subjects} onUpdateItem={updateItem} onLogSession={logSession} />
      )}
      {currentView === 'todo' && (
        <TodoList 
          tasks={tasks} 
          onAddTask={addTask} 
          onToggleTask={toggleTask} 
          onDeleteTask={deleteTask} 
          onEditTask={editTask} 
        />
      )}
    </Layout>
  );
};

export default App;
