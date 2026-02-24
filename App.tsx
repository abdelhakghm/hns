
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import GradesCalculator from './components/GradesCalculator.tsx';
import Auth from './components/Auth.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog, StudyStatus } from './types.ts';
import { db } from './services/dbService.ts';
import { Loader2, RefreshCw } from 'lucide-react';
import { PRIMARY_ADMIN_EMAIL } from './constants.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserSession(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session.user);
      } else {
        setUser(null);
        setSubjects([]);
        setFiles([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (supabaseUser: any) => {
    let profile = null;
    let retries = 0;
    
    while (!profile && retries < 5) {
      profile = await db.getUserById(supabaseUser.id);
      if (!profile) {
        await new Promise(r => setTimeout(r, 1000));
        retries++;
      }
    }

    const isPrimaryAdmin = supabaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    
    if (isPrimaryAdmin && profile?.role !== 'admin') {
      try {
        await db.updateProfileRole(supabaseUser.id, 'admin');
        profile = await db.getUserById(supabaseUser.id);
      } catch (e) {
        console.error("Critical: Failed to sync primary admin role.", e);
      }
    }

    const role = (isPrimaryAdmin || profile?.role === 'admin') ? 'admin' : 'student';

    const formattedUser: User = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Scholar',
      role: role as 'admin' | 'student',
      is_primary_admin: isPrimaryAdmin
    };
    
    setUser(formattedUser);
    await loadAppData(formattedUser.id);
    setIsLoading(false);
  };

  const loadAppData = async (userId: string) => {
    try {
      const [cloudSubs, cloudFiles] = await Promise.all([
        db.getSubjects(userId),
        db.getFiles()
      ]);
      setSubjects(cloudSubs);
      setFiles(cloudFiles);
    } catch (e) {
      console.error("Data load failed:", e);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
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
    if (user?.role !== 'admin') return;
    try {
      const newFile = await db.createFile(file);
      setFiles(prev => [newFile, ...prev]);
    } catch (e) {}
  };

  const onDeleteFile = async (id: string) => {
    if (user?.role !== 'admin') return;
    try {
      await db.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {}
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

  if (!user) {
    return <Auth onAuthSuccess={() => setIsLoading(true)} />;
  }

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={handleLogout}>
      {isSyncing && (
        <div className="fixed top-8 right-8 z-[200] flex items-center gap-3 bg-emerald-600 px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-right-4">
          <RefreshCw size={14} className="text-white animate-spin" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">HNS Syncing...</span>
        </div>
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          subjects={subjects} 
          onAddSubject={addSubject}
          onDeleteSubject={deleteSubject}
          onAddItem={addItemToSubject}
          onDeleteItem={deleteItem}
          onUpdateItem={updateItem}
        />
      )}
      {currentView === 'grades' && (
        <GradesCalculator userId={user.id} />
      )}
      {currentView === 'library' && (
        <Library subjects={subjects} files={files} user={user} />
      )}
      {currentView === 'focus' && (
        <StudyTimer subjects={subjects} onUpdateItem={updateItem} />
      )}
      {currentView === 'chat' && (
        <Chatbot user={user} />
      )}
      {currentView === 'admin' && user.role === 'admin' && (
        <AdminPanel user={user} files={files} onAddFile={onAddFile} onDeleteFile={onDeleteFile} />
      )}
    </Layout>
  );
};

export default App;
