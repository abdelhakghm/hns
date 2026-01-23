
import { supabase } from './supabase.ts';
import { User, Subject, StudyItem, FileResource, StudyItemType } from '../types';

export const db = {
  async testConnection() {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: "Connected to HNS Cloud" };
    } catch (e: any) {
      return { success: false, message: "Local Mode Active" };
    }
  },

  async getUserByEmail(email: string) {
    const { data } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
    return data;
  },

  // Admin Management
  async getAllAdmins() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'admin');
    return data || [];
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
    const { data: subjects } = await supabase.from('subjects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!subjects || subjects.length === 0) return [];
    
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
  },

  async createSubject(userId: string, name: string, category: string) {
    // Note: user_id is automatically set by the database default auth.uid()
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
    const { data } = await supabase.from('file_resources').select('*').order('date_added', { ascending: false });
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
    // Fix: Using log.exercises_added instead of log.exercisesAdded
    await supabase.from('study_logs').insert({
      item_id: itemId,
      note: log.note,
      exercises_added: log.exercises_added || 0,
      timestamp: log.timestamp
    });
  },

  async getLogs(itemId: string) {
    const { data } = await supabase.from('study_logs').select('*').eq('item_id', itemId).order('created_at', { ascending: false });
    return data || [];
  },

  async getChatHistory(userId: string) {
    const { data } = await supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    return data || [];
  },

  async saveChatMessage(userId: string, role: string, content: string) {
    // user_id is set by default auth.uid()
    await supabase.from('chat_history').insert({ role, content });
  },

  // Visualizations Persistence
  async getVisualizations(userId: string) {
    const { data } = await supabase.from('visualizations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },

  async saveVisualization(userId: string, viz: any) {
    // user_id is set by default auth.uid()
    const { data } = await supabase.from('visualizations').insert({
      prompt: viz.prompt,
      video_url: viz.video_url,
      aspect_ratio: viz.aspect_ratio,
      resolution: viz.resolution
    }).select().single();
    
    return data;
  }
};
