
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
      const { data: { session } } = await supabase.auth.getSession();
      const conn = await db.testConnection();
      setCloudStatus({ connected: conn.success, message: conn.message });
      
      if (session?.user) {
        try {
          const profile = await db.getUserByEmail(session.user.email!);
          
          const u: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'HNS Student',
            role: profile?.role || 'student',
            is_primary_admin: profile?.role === 'admin'
          };
          
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));

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
        localStorage.removeItem(USER_KEY);
        try {
          const cloudFiles = await db.getFiles();
          setFiles(cloudFiles);
        } catch (e) {}
      }

      setTimeout(() => setIsLoading(false), 2000);
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSubjects([]);
        localStorage.removeItem(USER_KEY);
      }
    });

    return () => subscription.unsubscribe();
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

  const handleLogout = async () => {
    setIsSyncing(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(USER_KEY);
      sessionStorage.clear();
      setUser(null);
      setSubjects([]);
      setFiles([]);
      setCurrentView('dashboard');
    } catch (e) {
      console.error("Logout failed:", e);
      localStorage.removeItem(USER_KEY);
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-[120px] opacity-20 translate-x-12 translate-y-12 animate-pulse [animation-delay:1s]"></div>
          
          <img 
            src={APP_LOGO_URL} 
            alt="HNS Institutional Logo" 
            className="w-40 h-40 relative z-10 object-contain drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-in zoom-in-50 duration-1000" 
          />
        </div>
        
        <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
          <div className="h-full bg-emerald-600 animate-progress-loading"></div>
        </div>
        
        <div className="text-center space-y-2">
           <h2 className="font-poppins font-bold text-slate-900 tracking-tight text-2xl">HNS Hub</h2>
           <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.3em] opacity-80">Connecting to Academic Core</p>
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
              <WifiOff size={14} />
              OFFLINE MODE
            </div>
          ) : (
             <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 text-[10px] font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              HNS CLOUD ACTIVE
            </div>
          )}
        </div>

        {/* Fix: Removed non-existent props onUpdateSubject and onReorder to match DashboardProps interface */}
        {currentView === 'dashboard' && <Dashboard subjects={subjects} onAddSubject={addSubject} onDeleteSubject={deleteSubject} onAddItem={addItemToSubject} onDeleteItem={deleteItem} onUpdateItem={updateItem} />}
        {currentView === 'library' && <Library subjects={subjects} files={files} user={user} />}
        {currentView === 'focus' && <StudyTimer subjects={subjects} onUpdateItem={updateItem} />}
        {currentView === 'chat' && <Chatbot user={user} />}
        {currentView === 'vision' && <VisionGenerator userId={user.id} />}
        {currentView === 'admin' && <AdminPanel user={user} files={files} onAddFile={handleAddFile} onDeleteFile={handleDeleteFile} />}

        {!cloudStatus.connected && (
          <div className="mt-12 p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex items-center gap-4 text-amber-800">
            <div className="p-3 bg-amber-100 rounded-2xl"><AlertTriangle size={24} /></div>
            <div>
              <p className="font-bold text-sm">Offline Alert</p>
              <p className="text-xs opacity-80">Your data is saved locally on this browser. Reconnect to sync with the HNS secure servers.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
