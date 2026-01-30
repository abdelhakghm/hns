
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types.ts';
import { db } from './services/dbService.ts';
import { Zap, Loader2 } from 'lucide-react';

const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000000', 
  name: 'HNS Scholar',
  role: 'admin' 
};

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const initApp = async () => {
    setIsLoading(true);
    try {
      const [cloudSubs, cloudFiles] = await Promise.all([
        db.getSubjects(MOCK_USER.id),
        db.getFiles()
      ]);
      
      setSubjects(cloudSubs);
      setFiles(cloudFiles);
    } catch (e) {
      console.error("DEBUG: Initialization error:", e);
    } finally {
      // Small artificial delay for smooth transition
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  const addSubject = async (name: string, category: string) => {
    setIsSyncing(true);
    try {
      const id = await db.createSubject(user.id, name, category);
      setSubjects(prev => [...prev, { id, name, category, items: [] }]);
    } catch (e) {}
    setIsSyncing(false);
  };

  const deleteSubject = async (id: string) => {
    setIsSyncing(true);
    try {
      await db.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (e) {}
    setIsSyncing(false);
  };

  const addItemToSubject = async (subjectId: string, item: Omit<StudyItem, 'id' | 'logs' | 'progressPercent'>) => {
    setIsSyncing(true);
    try {
      const id = await db.createItem(user.id, subjectId, item);
      setSubjects(prev => prev.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, items: [...s.items, { ...item, id, logs: [], progressPercent: Math.round((item.exercisesSolved/item.totalExercises)*100) }] };
      }));
    } catch (e: any) {}
    setIsSyncing(false);
  };

  const deleteItem = async (subjectId: string, itemId: string) => {
    setIsSyncing(true);
    try {
      await db.deleteItem(itemId);
      setSubjects(prev => prev.map(s => (s.id === subjectId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)));
    } catch (e) {}
    setIsSyncing(false);
  };

  const updateItem = async (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        items: s.items.map(i => {
          if (i.id !== itemId) return i;
          
          const newSolved = updates.exercisesDelta !== undefined 
            ? Math.min(i.totalExercises, Math.max(0, i.exercisesSolved + updates.exercisesDelta))
            : (updates.exercisesSolved !== undefined ? updates.exercisesSolved : i.exercisesSolved);
            
          const newStatus = newSolved === i.totalExercises ? 'completed' : (newSolved > 0 ? 'in-progress' : 'not-started');
          const newPercent = Math.round((newSolved / i.totalExercises) * 100);

          db.updateItem(itemId, { 
            exercisesSolved: newSolved, 
            status: newStatus, 
            progress_percent: newPercent 
          });

          if (logEntry) {
            db.createLog(user.id, itemId, logEntry);
          }

          return { ...i, ...updates, exercisesSolved: newSolved, status: newStatus, progressPercent: newPercent };
        })
      };
    }));
  };

  const addFile = async (file: Omit<FileResource, 'id' | 'dateAdded'>) => {
    const newFile = await db.createFile(file);
    setFiles(prev => [newFile, ...prev]);
  };

  const deleteFile = async (id: string) => {
    await db.deleteFile(id);
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <div className="relative mb-10 animate-float">
          <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-emerald-500 fill-emerald-500/20" size={36} />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white tracking-tighter uppercase">HNS HUB</h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.5em] animate-pulse">Neural Sync Initialization</p>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-600 w-1/2 animate-[progress_2s_infinite_linear]" 
                    style={{ animationName: 'progress-loading' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={() => {}}>
      {currentView === 'dashboard' && (
        <Dashboard 
          subjects={subjects} 
          onAddSubject={addSubject} 
          onDeleteSubject={deleteSubject}
          onAddItem={addItemToSubject}
          onDeleteItem={deleteItem}
          onUpdateItem={updateItem}
        />
      )}
      {currentView === 'library' && <Library files={files} subjects={subjects} user={user} />}
      {currentView === 'focus' && <StudyTimer subjects={subjects} onUpdateItem={updateItem} />}
      {currentView === 'chat' && <Chatbot user={user} />}
      {currentView === 'admin' && (
        <AdminPanel 
          user={user} 
          files={files} 
          onAddFile={addFile} 
          onDeleteFile={deleteFile} 
        />
      )}

      {isSyncing && (
        <div className="fixed bottom-10 right-10 md:bottom-12 md:right-12 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[200]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Optimizing Node</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
