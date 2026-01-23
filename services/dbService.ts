
import { supabase } from './supabase.ts';
import { User, Subject, StudyItem, FileResource, StudyItemType } from '../types';

export const db = {
  async testConnection() {
    try {
      // Use a race to prevent long-hanging "Failed to fetch" on unreachable domains
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
      const headRequest = supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      await Promise.race([headRequest, timeout]);
      
      return { success: true, message: "Connected to HNS Cloud" };
    } catch (e: any) {
      console.warn("Cloud connection check failed:", e.message);
      return { success: false, message: "Local Mode Active" };
    }
  },

  async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
      if (error) return null;
      return data;
    } catch (e) { return null; }
  },

  // Admin Management
  async getAllAdmins() {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
      return data || [];
    } catch (e) { return []; }
  },

  async addAdminByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email.toLowerCase().trim())
      .select();
    if (error) throw error;
    return data;
  },

  async removeAdminStatus(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'student' })
      .eq('id', userId);
    if (error) throw error;
  },

  // Academic Progress
  async getSubjects(userId: string): Promise<Subject[]> {
    try {
      const { data: subjects, error: sError } = await supabase.from('subjects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (sError || !subjects || subjects.length === 0) return [];
      
      const { data: items } = await supabase.from('study_items').select('*').in('subject_id', subjects.map(s => s.id));
      
      return subjects.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        items: (items || []).filter(i => i.subject_id === s.id).map(i => ({
          id: i.id,
          title: i.title,
          type: i.type as StudyItemType,
          status: i.status as any,
          exercisesSolved: i.exercises_solved,
          totalExercises: i.total_exercises,
          progressPercent: i.progress_percent,
          logs: []
        }))
      }));
    } catch (e) { return []; }
  },

  async createSubject(userId: string, name: string, category: string) {
    const { data } = await supabase.from('subjects').insert({ name, category }).select('id').single();
    return data?.id || window.crypto.randomUUID();
  },

  async deleteSubject(id: string) {
    await supabase.from('subjects').delete().eq('id', id);
  },

  async createItem(subjectId: string, item: any) {
    const { data } = await supabase.from('study_items').insert({
      subject_id: subjectId,
      title: item.title,
      type: item.type,
      status: item.status,
      exercises_solved: item.exercisesSolved,
      total_exercises: item.totalExercises
    }).select('id').single();
    return data?.id || window.crypto.randomUUID();
  },

  async updateItem(itemId: string, updates: any) {
    await supabase.from('study_items').update({
      exercises_solved: updates.exercisesSolved,
      status: updates.status
    }).eq('id', itemId);
  },

  async deleteItem(itemId: string) {
    await supabase.from('study_items').delete().eq('id', itemId);
  },

  // File Repository
  async getFiles(): Promise<FileResource[]> {
    try {
      const { data, error } = await supabase.from('file_resources').select('*').order('date_added', { ascending: false });
      if (error) return [];
      return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        category: r.category,
        tags: r.tags || [],
        url: r.url,
        dateAdded: new Date(r.date_added).toLocaleDateString(),
        fileName: r.file_name
      }));
    } catch (e) { return []; }
  },

  async createFile(file: Omit<FileResource, 'id' | 'dateAdded'>) {
    const { data, error } = await supabase.from('file_resources').insert({
      title: file.title,
      description: file.description,
      category: file.category,
      tags: file.tags || [],
      url: file.url,
      file_name: file.fileName
    }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteFile(id: string) {
    await supabase.from('file_resources').delete().eq('id', id);
  },

  // Logs & Chat
  async createLog(itemId: string, log: any) {
    await supabase.from('study_logs').insert({
      item_id: itemId,
      note: log.note,
      exercises_added: log.exercises_added || 0,
      timestamp: log.timestamp
    });
  },

  async getLogs(itemId: string) {
    try {
      const { data } = await supabase.from('study_logs').select('*').eq('item_id', itemId).order('created_at', { ascending: false });
      return data || [];
    } catch (e) { return []; }
  },

  async getChatHistory(userId: string) {
    try {
      const { data } = await supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true });
      return data || [];
    } catch (e) { return []; }
  },

  async saveChatMessage(userId: string, role: string, content: string) {
    try {
      await supabase.from('chat_history').insert({ role, content });
    } catch (e) {}
  },

  // Visualizations Persistence
  async getVisualizations(userId: string) {
    try {
      const { data } = await supabase.from('visualizations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return data || [];
    } catch (e) { return []; }
  },

  async saveVisualization(userId: string, viz: any) {
    const { data } = await supabase.from('visualizations').insert({
      prompt: viz.prompt,
      video_url: viz.video_url,
      aspect_ratio: viz.aspect_ratio,
      resolution: viz.resolution
    }).select('id').single();
    
    return data;
  }
};
