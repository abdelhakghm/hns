
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import StudyTimer from './components/StudyTimer';
import Chatbot from './components/Chatbot';
import AdminPanel from './components/AdminPanel';
import { User, Subject, FileResource, AppView, StudyItem, StudyLog } from './types';
import { INITIAL_SUBJECTS, INITIAL_FILES, PRIMARY_ADMIN_EMAIL } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [files, setFiles] = useState<FileResource[]>(INITIAL_FILES);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Load Global Configs (Admin list, etc)
  useEffect(() => {
    const savedAdmins = localStorage.getItem('hns_admin_list');
    if (savedAdmins) setAdminEmails(JSON.parse(savedAdmins));
    
    const savedFiles = localStorage.getItem('hns_repository_files');
    if (savedFiles) setFiles(JSON.parse(savedFiles));

    const savedUser = localStorage.getItem('hns_session_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.id);
    }
  }, []);

  // Save Global Configs
  useEffect(() => {
    localStorage.setItem('hns_admin_list', JSON.stringify(adminEmails));
  }, [adminEmails]);

  useEffect(() => {
    localStorage.setItem('hns_repository_files', JSON.stringify(files));
  }, [files]);

  // Handle User Data Persistence (Personal space)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`hns_subjects_${user.id}`, JSON.stringify(subjects));
    }
  }, [subjects, user]);

  const loadUserData = (userId: string) => {
    const savedData = localStorage.getItem(`hns_subjects_${userId}`);
    if (savedData) {
      setSubjects(JSON.parse(savedData));
    } else {
      setSubjects(INITIAL_SUBJECTS); // Default for new users
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('hns_session_user', JSON.stringify(newUser));
    loadUserData(newUser.id);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSubjects([]); // Clear sensitive data from memory
    localStorage.removeItem('hns_session_user');
  };

  // --- Data Management Actions (Passed to Components) ---

  const addSubject = (name: string, category: string) => {
    const newSub: Subject = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      items: []
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, name: string, category: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name, category } : s));
  };

  const addItemToSubject = (subjectId: string, item: Omit<StudyItem, 'id' | 'logs'>) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          items: [...s.items, { ...item, id: 'item_' + Math.random().toString(36).substr(2, 9), logs: [] }]
        };
      }
      return s;
    }));
  };

  const deleteItemFromSubject = (subjectId: string, itemId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          items: s.items.filter(i => i.id !== itemId)
        };
      }
      return s;
    }));
  };

  const updateItemProgress = (
    subjectId: string, 
    itemId: string, 
    updates: Partial<StudyItem> & { exercisesDelta?: number }, 
    logEntry?: Omit<StudyLog, 'id'>
  ) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          items: s.items.map(item => {
            if (item.id === itemId) {
              const newLogs = logEntry 
                ? [...item.logs, { ...logEntry, id: 'log_' + Math.random().toString(36).substr(2, 9) }]
                : item.logs;
              
              const exercisesSolved = updates.exercisesDelta !== undefined 
                ? Math.min(item.exercisesSolved + updates.exercisesDelta, item.totalExercises)
                : (updates.exercisesSolved !== undefined ? updates.exercisesSolved : item.exercisesSolved);

              const status = updates.status !== undefined 
                ? updates.status 
                : (exercisesSolved >= item.totalExercises ? 'completed' : item.status);

              const merged = { ...item, ...updates, exercisesSolved, status };
              const { exercisesDelta, ...cleanItem } = merged as any;
              
              let progressPercent = cleanItem.progressPercent;
              if (cleanItem.totalExercises > 0) {
                progressPercent = Math.round((cleanItem.exercisesSolved / cleanItem.totalExercises) * 100);
              }

              return { 
                ...cleanItem, 
                progressPercent,
                logs: newLogs 
              };
            }
            return item;
          })
        };
      }
      return s;
    }));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} adminEmails={adminEmails} />;
  }

  return (
    <Layout user={user} currentView={currentView} onSetView={setCurrentView} onLogout={handleLogout}>
      {currentView === 'dashboard' && (
        <Dashboard 
          subjects={subjects} 
          onAddSubject={addSubject}
          onDeleteSubject={deleteSubject}
          onUpdateSubject={updateSubject}
          onAddItem={addItemToSubject}
          onDeleteItem={deleteItemFromSubject}
          onUpdateItem={updateItemProgress}
          onReorder={setSubjects} 
        />
      )}
      {currentView === 'library' && (
        <Library subjects={subjects} files={files} user={user} />
      )}
      {currentView === 'focus' && (
        <StudyTimer subjects={subjects} onUpdateItem={updateItemProgress} />
      )}
      {currentView === 'chat' && (
        <Chatbot />
      )}
      {currentView === 'admin' && user.role === 'admin' && (
        <AdminPanel 
          user={user}
          subjects={subjects} 
          setSubjects={setSubjects} 
          files={files} 
          setFiles={setFiles} 
          adminEmails={adminEmails}
          setAdminEmails={setAdminEmails}
        />
      )}
    </Layout>
  );
};

export default App;
