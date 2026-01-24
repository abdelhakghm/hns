
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import VisionGenerator from './components/VisionGenerator.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types.ts';
import { db } from './services/dbService.ts';
import { supabase } from './services/supabase.ts';
import { APP_LOGO_URL } from './constants.ts';
import { WifiOff, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'Initializing...' });
  const [initError, setInitError] = useState<string | null>(null);

  const initApp = async () => {
    setIsLoading(true);
    setInitError(null);
    try {
      const [sessionRes, conn] = await Promise.all([
        supabase.auth.getSession().catch(() => ({ data: { session: null } })),
        db.testConnection()
      ]);

      const session = sessionRes.data?.session;
      setCloudStatus({ connected: conn.success, message: conn.message });
      
      if (session?.user) {
        const profile = await db.getUserById(session.user.id);
        
        const u: User = {
          id: session.user.id,
          email: session.user.email || undefined,
          name: profile?.full_name || session.user.user_metadata?.full_name || 'HNS Guest',
          role: (profile?.role as 'student' | 'admin') || 'student',
          is_primary_admin: profile?.role === 'admin'
        };
        
        setUser(u);
        const [cloudSubs, cloudFiles] = await Promise.all([
          db.getSubjects(u.id).catch(() => []),
          db.getFiles().catch(() => [])
        ]);
        setSubjects(cloudSubs);
        setFiles(cloudFiles);
      } else {
        const cloudFiles = await db.getFiles().catch(() => []);
        setFiles(cloudFiles);
      }
    } catch (e: any) {
      setInitError(e.message || "Establishing secure link...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initApp();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSubjects([]);
      } else if (event === 'SIGNED_IN' && session) {
        initApp();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (u: User) => {
    setIsSyncing(true);
    setUser(u);
    try {
      const [cloudSubs, cloudFiles] = await Promise.all([
        db.getSubjects(u.id).catch(() => []),
        db.getFiles().catch(() => [])
      ]);
      setSubjects(cloudSubs);
      setFiles(cloudFiles);
    } catch (e) {}
    setIsSyncing(false);
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    try {
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
      setSubjects([]);
      setFiles([]);
      setCurrentView('dashboard');
    } catch (e) {
      setUser(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const addSubject = async (name: string, category: string) => {
    if (!user) return;
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
      const id = await db.createItem(subjectId, item);
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
          const newSolved = updates.exercisesDelta !== undefined ? Math.min(i.exercisesSolved + updates.exercisesDelta, i.totalExercises) : (updates.exercisesSolved ?? i.exercisesSolved);
          const progressPercent = Math.round((newSolved / i.totalExercises) * 100);
          const finalUpdates = { ...updates, exercisesSolved: newSolved, progressPercent, status: updates.status || (newSolved >= i.totalExercises ? 'completed' : i.status) };
          db.updateItem(itemId, finalUpdates).catch(() => {});
          if (logEntry) db.createLog(itemId, logEntry).catch(() => {});
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
          <img 
            src={APP_LOGO_URL} 
            alt="HNS Hub" 
            className="w-40 h-40 relative z-10 object-contain drop-shadow-2xl animate-in zoom-in-50 duration-700" 
          />
        </div>
        <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
          <div className="h-full bg-emerald-600 animate-progress-loading"></div>
        </div>
        <div className="text-center space-y-2">
           <h2 className="font-poppins font-bold text-slate-900 text-2xl">Establishing Link...</h2>
           <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-80">Syncing Institutional Core</p>
           {initError && (
             <div className="mt-4 flex flex-col items-center gap-2">
               <button onClick={initApp} className="text-emerald-600 hover:underline flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                 <RefreshCw size={10} /> Manual Sync
               </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={handleLogout}>
      <div className="relative">
        <div className="fixed top-24 right-10 z-[60] flex flex-col gap-2 items-end">
          {isSyncing && (
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold animate-pulse">
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Syncing...
            </div>
          )}
          {!cloudStatus.connected ? (
            <div className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-[10px] font-bold">
              <WifiOff size={14} /> OFFLINE MODE
            </div>
          ) : (
             <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-[10px] font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> CLOUD ACTIVE
            </div>
          )}
        </div>

        {currentView === 'dashboard' && <Dashboard subjects={subjects} onAddSubject={addSubject} onDeleteSubject={deleteSubject} onAddItem={addItemToSubject} onDeleteItem={deleteItem} onUpdateItem={updateItem} />}
        {currentView === 'library' && <Library subjects={subjects} files={files} user={user} />}
        {currentView === 'focus' && <StudyTimer subjects={subjects} onUpdateItem={updateItem} />}
        {currentView === 'chat' && <Chatbot user={user} />}
        {currentView === 'vision' && <VisionGenerator userId={user.id} />}
        {currentView === 'admin' && <AdminPanel user={user} files={files} onAddFile={handleAddFile} onDeleteFile={handleDeleteFile} />}
      </div>
    </Layout>
  );
};

export default App;
