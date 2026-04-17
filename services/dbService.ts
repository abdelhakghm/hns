
import { User, Subject, FileResource, StudyItemType } from '../types';

// Volatile In-Memory Repository (Clears on refresh)
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
    return { success: true, message: "HNS Local Node: Active" };
  },

  // Academic Progress
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

  // Semester Averages Persistence
  async saveSemesterAverage(userId: string, semesterName: string, average: number) {
    const key = `${userId}_${semesterName}`;
    memoryStore.averages[key] = average;
  },

  async getSemesterAverage(userId: string, semesterName: string): Promise<number | null> {
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

  // To-Do List Management
  async getTasks(userId: string) {
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
    memoryStore.todos.push(newTask);
    return newTask;
  },

  async updateTask(userId: string, taskId: string, updates: any) {
    memoryStore.todos = memoryStore.todos.map(t => t.id === taskId ? { ...t, ...updates } : t);
  },

  async deleteTask(userId: string, taskId: string) {
    memoryStore.todos = memoryStore.todos.filter(t => t.id !== taskId);
  },

  // Study Analytics
  async getStudySessions(userId: string) {
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
    memoryStore.sessions.push(newSession);
    return newSession;
  }
};
