
import { User, Subject, FileResource, StudyItemType } from '../types';
import { supabase } from './supabaseClient';

// Fallback In-Memory Repository (Used when Cloud Node is unreachable or unconfigured)
const memoryStore = {
  subjects: [] as any[],
  items: [] as any[],
  files: [] as any[],
  todos: [] as any[],
  sessions: [] as any[],
  averages: {} as Record<string, number>
};

export const db = {
  async testConnection() {
    try {
      const { data, error } = await supabase.from('academic_averages').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: "HNS Cloud Node: Active" };
    } catch (e) {
      return { success: false, message: "HNS Local Node: Active (Cloud Offline)" };
    }
  },

  // Academic Progress (Currently using memory fallback for complex subjects)
  async getSubjects(userId: string): Promise<Subject[]> {
    return memoryStore.subjects.map(s => ({
      ...s,
      items: memoryStore.items.filter(i => i.subjectId === s.id)
    }));
  },

  async createSubject(userId: string, name: string, category: string) {
    const id = Math.random().toString(36).substr(2, 9);
    memoryStore.subjects.push({ id, name, category, user_id: userId });
    return id;
  },

  async deleteSubject(userId: string, id: string) {
    memoryStore.subjects = memoryStore.subjects.filter(s => s.id !== id);
    memoryStore.items = memoryStore.items.filter(i => i.subjectId !== id);
  },

  async createItem(userId: string, subjectId: string, item: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem = {
      ...item,
      id,
      subjectId,
      user_id: userId,
      status: item.status || 'not-started',
      progressPercent: item.progressPercent || 0,
      logs: []
    };
    memoryStore.items.push(newItem);
    return id;
  },

  async updateItem(userId: string, itemId: string, updates: any) {
    memoryStore.items = memoryStore.items.map(i => i.id === itemId ? { ...i, ...updates } : i);
  },

  async deleteItem(userId: string, itemId: string) {
    memoryStore.items = memoryStore.items.filter(i => i.id !== itemId);
  },

  // Semester Averages Persistence (SUPABASE STACK)
  // Maps to: the average and the average of what (L1-S1)
  async saveSemesterAverage(userId: string, semesterName: string, average: number) {
    // Local Sync
    const key = `${userId}_${semesterName}`;
    memoryStore.averages[key] = average;

    // Cloud Sync
    try {
      const { error } = await supabase
        .from('academic_averages')
        .upsert({ 
          user_id: userId, 
          session_key: semesterName, 
          average: average,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,session_key' });
      
      if (error) console.error('Cloud Sync Error (Averages):', error.message);
    } catch (e) {
      console.warn('Supabase Offline: Average saved to local cache only.');
    }
  },

  async getSemesterAverage(userId: string, semesterName: string): Promise<number | null> {
    // Try Cloud first
    try {
      const { data, error } = await supabase
        .from('academic_averages')
        .select('average')
        .eq('user_id', userId)
        .eq('session_key', semesterName)
        .single();
      
      if (data) return Number(data.average);
    } catch (e) {
      // Fallback to local
    }

    const key = `${userId}_${semesterName}`;
    return memoryStore.averages[key] || null;
  },

  async getFiles(): Promise<FileResource[]> {
    return memoryStore.files;
  },

  async createFile(file: Omit<FileResource, 'id' | 'dateAdded'>) {
    const newFile = {
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toLocaleDateString()
    };
    memoryStore.files.push(newFile);
    return newFile;
  },

  async deleteFile(id: string) {
    memoryStore.files = memoryStore.files.filter(f => f.id !== id);
  },

  async createLog(userId: string, itemId: string, log: any) {
    // Optional implementation
  },

  // To-Do List Management (SUPABASE STACK)
  async getTasks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('mission_registry')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (data) return data;
    } catch (e) {}
    
    return memoryStore.todos.filter(t => t.user_id === userId);
  },

  async createTask(userId: string, title: string) {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      title,
      completed: false,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('mission_registry')
        .insert([{ user_id: userId, title, completed: false }]);
      if (error) console.error('Cloud Sync Error (Todos):', error.message);
    } catch (e) {}

    memoryStore.todos.push(newTask);
    return newTask;
  },

  async updateTask(userId: string, taskId: string, updates: any) {
    try {
      await supabase
        .from('mission_registry')
        .update(updates)
        .eq('id', taskId);
    } catch (e) {}

    memoryStore.todos = memoryStore.todos.map(t => t.id === taskId ? { ...t, ...updates } : t);
  },

  async deleteTask(userId: string, taskId: string) {
    try {
      await supabase
        .from('mission_registry')
        .delete()
        .eq('id', taskId);
    } catch (e) {}

    memoryStore.todos = memoryStore.todos.filter(t => t.id !== taskId);
  },

  // Study Analytics (SUPABASE STACK)
  async getStudySessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', userId);
      if (data) return data;
    } catch (e) {}
    return memoryStore.sessions.filter(s => s.user_id === userId);
  },

  async createStudySession(userId: string, subjectId: string | null, durationSeconds: number) {
    const newSession = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      subject_id: subjectId,
      duration_seconds: durationSeconds,
      created_at: new Date().toISOString()
    };

    try {
      await supabase
        .from('study_analytics')
        .insert([{ user_id: userId, duration_seconds: durationSeconds }]);
    } catch (e) {}

    memoryStore.sessions.push(newSession);
    return newSession;
  }
};
