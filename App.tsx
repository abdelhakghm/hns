
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types.ts';
import { db } from './services/dbService.ts';
import { Database, WifiOff, AlertTriangle, CloudCheck } from 'lucide-react';

const USER_KEY = 'hns_companion_user';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: '' });

  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem(USER_KEY);
      const conn = await db.testConnection();
      setCloudStatus({ connected: conn.success, message: conn.message });
      
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        
        try {
          const [cloudSubs, cloudFiles] = await Promise.all([
            db.getSubjects(u.id),
            db.getFiles()
          ]);
          setSubjects(cloudSubs);
          setFiles(cloudFiles);
        } catch (e) {
          console.error("Data load failed:", e);
        }
      } else {
        try {
          const cloudFiles = await db.getFiles();
          setFiles(cloudFiles);
        } catch (e) {}
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  const handleLogin = async (u: User) => {
    setIsSyncing(true);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setUser(u);
      const [cloudSubs, cloudFiles] = await Promise.all([
        db.getSubjects(u.id),
        db.getFiles()
      ]);
      setSubjects(cloudSubs);
      setFiles(cloudFiles);
    } catch (e: any) {
      console.error("Login data sync failed:", e);
      setUser(u);
    }
    setIsSyncing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.clear();
    setUser(null);
    setSubjects([]);
    setFiles([]);
    setCurrentView('dashboard');
    window.location.reload();
  };

  const addSubject = async (name: string, category: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const id = await db.createSubject(user.id, name, category);
      setSubjects(prev => [...prev, { id, name, category, items: [] }]);
    } catch (e: any) { 
      console.error(e);
    }
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
      const id = await db.createItem(subjectId, item);
      setSubjects(prev => prev.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, items: [...s.items, { ...item, id, logs: [], progressPercent: Math.round((item.exercisesSolved/item.totalExercises)*100) }] };
      }));
    } catch (e: any) {
      console.error(e);
    }
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
          const newSolved = updates.exercisesDelta !== undefined ? Math.min(i.exercisesSolved + updates.exercisesDelta, i.totalExercises) : (updates.exercisesSolved ?? i.exercisesSolved);
          const progressPercent = Math.round((newSolved / i.totalExercises) * 100);
          const finalUpdates = { ...updates, exercisesSolved: newSolved, progressPercent, status: updates.status || (newSolved >= i.totalExercises ? 'completed' : i.status) };
          
          db.updateItem(itemId, finalUpdates).catch(console.error);
          if (logEntry) db.createLog(itemId, logEntry).catch(console.error);
          
          return { ...i, ...finalUpdates };
        })
      };
    }));
  };

  const handleAddFile = async (file: Omit<FileResource, 'id' | 'dateAdded'>) => {
    setIsSyncing(true);
    try {
      await db.createFile(file);
      const cloudFiles = await db.getFiles();
      setFiles(cloudFiles);
    } catch (e) {}
    setIsSyncing(false);
  };

  const handleDeleteFile = async (id: string) => {
    setIsSyncing(true);
    try {
      await db.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {}
    setIsSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-800">Synchronizing HNS Hub...</p>
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={handleLogout}>
      <div className="relative">
        {/* Connection Status Indicator */}
        <div className="fixed top-24 right-10 z-50 flex flex-col gap-2 items-end">
          {isSyncing && (
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Syncing...
            </div>
          )}
          {!cloudStatus.connected ? (
            <div className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-[10px] font-bold">
              <WifiOff size={14} />
              الوضع المحلي (السحابة غير متوفرة)
            </div>
          ) : (
             <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-[10px] font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              HNS Supabase Sync Active
            </div>
          )}
        </div>

        {currentView === 'dashboard' && <Dashboard subjects={subjects} onAddSubject={addSubject} onDeleteSubject={deleteSubject} onUpdateSubject={() => {}} onAddItem={addItemToSubject} onDeleteItem={deleteItem} onUpdateItem={updateItem} onReorder={setSubjects} />}
        {currentView === 'library' && <Library subjects={subjects} files={files} user={user} />}
        {currentView === 'focus' && <StudyTimer subjects={subjects} onUpdateItem={updateItem} />}
        {currentView === 'chat' && <Chatbot user={user} />}
        {currentView === 'admin' && <AdminPanel user={user} files={files} onAddFile={handleAddFile} onDeleteFile={handleDeleteFile} />}

        {/* Global Warning for Local Mode */}
        {!cloudStatus.connected && (
          <div className="mt-12 p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex items-center gap-4 text-amber-800">
            <div className="p-3 bg-amber-100 rounded-2xl"><AlertTriangle size={24} /></div>
            <div>
              <p className="font-bold text-sm">تنبيه: قاعدة البيانات السحابية غير متصلة</p>
              <p className="text-xs opacity-80">يتم حفظ بياناتك حالياً على هذا المتصفح فقط بشكل آمن. يرجى مراجعة المسؤول للتأكد من حالة الخادم.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
