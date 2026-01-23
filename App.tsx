
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import StudyTimer from './components/StudyTimer.tsx';
import Chatbot from './components/Chatbot.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types.ts';
import { INITIAL_SUBJECTS, INITIAL_FILES } from './constants.ts';
import { supabase, isSupabaseConfigured } from './services/supabase.ts';

const STORAGE_KEY = 'hns_companion_data';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const loadLocalData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSubjects(JSON.parse(saved));
      } catch (e) {
        setSubjects(INITIAL_SUBJECTS);
      }
    } else {
      setSubjects(INITIAL_SUBJECTS);
    }
    setFiles(INITIAL_FILES);
  };

  const saveLocalData = (newSubjects: Subject[]) => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSubjects));
    }
  };

  useEffect(() => {
    const initSession = async () => {
      if (!isSupabaseConfigured) {
        setUser({
          id: 'local-user',
          email: 'student@hns-re2sd.dz',
          name: 'HNS Student (Local)',
          role: 'student'
        });
        loadLocalData();
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || 'HNS Student',
            role: profile?.role || 'student',
            isPrimary: profile?.is_primary_admin
          };
          setUser(userData);
          fetchUserData(userData.id);
        } else {
          loadLocalData();
        }
        fetchGlobalResources();
      } catch (err) {
        loadLocalData();
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubjects([]);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: subjectsData, error } = await supabase
        .from('subjects')
        .select(`
          id, name, category, items:study_items (
            id, title, type, status, exercisesSolved:exercises_solved, 
            totalExercises:total_exercises, progressPercent:progress_percent,
            logs:study_logs (id, timestamp, note, exercisesAdded:exercises_added)
          )
        `)
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      if (!error && subjectsData) {
        setSubjects(subjectsData as any);
      } else {
        loadLocalData();
      }
    } catch (e) {
      loadLocalData();
    }
  };

  const fetchGlobalResources = async () => {
    if (!isSupabaseConfigured) {
      setFiles(INITIAL_FILES);
      return;
    }
    try {
      const { data, error } = await supabase.from('file_resources').select('*').order('date_added', { ascending: false });
      if (!error && data) {
        setFiles(data.map(f => ({
          id: f.id, title: f.title, description: f.description, category: f.category,
          tags: f.tags, url: f.url, dateAdded: f.date_added, fileName: f.file_name
        })));
      } else {
        setFiles(INITIAL_FILES);
      }
    } catch (e) {
      setFiles(INITIAL_FILES);
    }
  };

  const addSubject = async (name: string, category: string) => {
    if (!user) return;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('subjects').insert({ name, category, user_id: user.id }).select().single();
        if (!error && data) setSubjects(prev => [...prev, { ...data, items: [] } as any]);
      } catch (e) {}
    } else {
      const newSub: Subject = { id: Math.random().toString(), name, category, items: [] };
      const updated = [...subjects, newSub];
      setSubjects(updated);
      saveLocalData(updated);
    }
  };

  const deleteSubject = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('subjects').delete().eq('id', id);
    }
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    saveLocalData(updated);
  };

  const addItemToSubject = async (subjectId: string, item: Omit<StudyItem, 'id' | 'logs'>) => {
    if (isSupabaseConfigured) {
      await supabase.from('study_items').insert({
        subject_id: subjectId, title: item.title, type: item.type, status: item.status,
        exercises_solved: item.exercisesSolved, total_exercises: item.totalExercises
      });
      fetchUserData(user!.id);
    } else {
      const newItem: StudyItem = { ...item, id: Math.random().toString(), logs: [], progressPercent: Math.round((item.exercisesSolved/item.totalExercises)*100) };
      const updated = subjects.map(s => s.id === subjectId ? { ...s, items: [...s.items, newItem] } : s);
      setSubjects(updated);
      saveLocalData(updated);
    }
  };

  const updateItemProgress = async (
    subjectId: string, itemId: string, 
    updates: Partial<StudyItem> & { exercisesDelta?: number }, 
    logEntry?: Omit<StudyLog, 'id'>
  ) => {
    if (!user) return;

    if (isSupabaseConfigured) {
      const itemToUpdate = subjects.find(s => s.id === subjectId)?.items.find(i => i.id === itemId);
      if (!itemToUpdate) return;
      const newExercisesSolved = updates.exercisesDelta !== undefined 
        ? Math.min(itemToUpdate.exercisesSolved + updates.exercisesDelta, itemToUpdate.totalExercises)
        : (updates.exercisesSolved !== undefined ? updates.exercisesSolved : itemToUpdate.exercisesSolved);
      const newStatus = updates.status || (newExercisesSolved >= itemToUpdate.totalExercises ? 'completed' : itemToUpdate.status);
      await supabase.from('study_items').update({ exercises_solved: newExercisesSolved, status: newStatus }).eq('id', itemId);
      if (logEntry) await supabase.from('study_logs').insert({ item_id: itemId, note: logEntry.note, exercises_added: logEntry.exercisesAdded || 0 });
      fetchUserData(user.id);
    } else {
      const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          items: s.items.map(i => {
            if (i.id !== itemId) return i;
            const newSolved = updates.exercisesDelta !== undefined ? Math.min(i.exercisesSolved + updates.exercisesDelta, i.totalExercises) : (updates.exercisesSolved ?? i.exercisesSolved);
            const newLogs = logEntry ? [...i.logs, { ...logEntry, id: Math.random().toString() }] : i.logs;
            return { 
              ...i, 
              ...updates, 
              exercisesSolved: newSolved, 
              logs: newLogs,
              progressPercent: Math.round((newSolved / i.totalExercises) * 100),
              status: updates.status || (newSolved >= i.totalExercises ? 'completed' : i.status)
            };
          })
        };
      });
      setSubjects(updated);
      saveLocalData(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <p className="font-poppins font-bold text-slate-800 text-xl">Loading HNS Hub...</p>
      </div>
    );
  }

  if (!user && isSupabaseConfigured) {
    return <Auth onLogin={(u) => { setUser(u); fetchUserData(u.id); }} adminEmails={[]} />;
  }

  return (
    <Layout user={user!} currentView={currentView} onSetView={setCurrentView} onLogout={async () => { if(isSupabaseConfigured) await supabase.auth.signOut(); setUser(null); }}>
      <div className="relative">
        {!isSupabaseConfigured && (
          <div className="mb-6 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100 text-xs font-bold w-fit animate-pulse">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            LOCAL MODE: Progress saved to browser storage.
          </div>
        )}
        
        {currentView === 'dashboard' && (
          <Dashboard 
            subjects={subjects} onAddSubject={addSubject} onDeleteSubject={deleteSubject}
            onUpdateSubject={async (id, name, cat) => {
              if (isSupabaseConfigured) await supabase.from('subjects').update({ name, category: cat }).eq('id', id);
              const updated = subjects.map(s => s.id === id ? { ...s, name, category: cat } : s);
              setSubjects(updated); saveLocalData(updated);
            }}
            onAddItem={addItemToSubject}
            onDeleteItem={async (subId, itemId) => {
              if (isSupabaseConfigured) await supabase.from('study_items').delete().eq('id', itemId);
              const updated = subjects.map(s => s.id === subId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s);
              setSubjects(updated); saveLocalData(updated);
            }}
            onUpdateItem={updateItemProgress}
            onReorder={(newSubs) => { setSubjects(newSubs); saveLocalData(newSubs); }} 
          />
        )}
        {currentView === 'library' && <Library subjects={subjects} files={files} user={user!} />}
        {currentView === 'focus' && <StudyTimer subjects={subjects} onUpdateItem={updateItemProgress} />}
        {currentView === 'chat' && <Chatbot />}
        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminPanel user={user!} subjects={subjects} setSubjects={setSubjects} files={files} setFiles={setFiles} adminEmails={[]} setAdminEmails={() => {}} />
        )}
      </div>
    </Layout>
  );
};

export default App;
