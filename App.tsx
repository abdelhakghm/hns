
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Auth from './components/Auth.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types.ts';
import { db } from './services/dbService.ts';
import { Waves, Loader2 } from 'lucide-react';
import { PRIMARY_ADMIN_EMAIL } from './constants.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Listen to Auth State
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
    
    // Attempt to fetch profile with retries to account for trigger lag
    while (!profile && retries < 5) {
      profile = await db.getUserById(supabaseUser.id);
      if (!profile) {
        await new Promise(r => setTimeout(r, 1000));
        retries++;
      }
    }

    const isPrimaryAdmin = supabaseUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    
    // CRITICAL: Ensure the Primary Admin is actually an admin in the database
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
      setSubjects(prev => [...prev, { id, name, category, items: [] }]);
    } catch (e) {}
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
      setSubjects(prev => prev.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, items: [...s.items, { ...item, id, logs: [], progressPercent: Math.round((item.exercisesSolved/item.totalExercises)*100) }] };
      }));
    } catch (e: any) {}
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

          db.updateItem(user.id, itemId, { 
            exercises_solved: newSolved, 
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-10 animate-float">
          <div className="w-24 h-24 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Waves className="text-cyan-500" size={36} />
          </div>
        </div>
        <h1 className="text-3xl font-poppins font-bold text-white uppercase tracking-tighter">LiquidAI Hub</h1>
        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.5em] animate-pulse mt-4">Establishing Secure Flux</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={handleLogout}>
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
        <div className="fixed bottom-10 right-10 md:bottom-12 md:right-12 bg-cyan-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[200]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Liquid Sync</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
