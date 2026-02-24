
import { supabase } from './supabase.ts';
import { User, Subject, StudyItem, FileResource, StudyItemType } from '../types';

export const db = {
  async testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, message: "Connected to HNS Cloud" };
    } catch (e: any) {
      console.warn("DB Connection Test failed:", e.message);
      return { success: false, message: "Local Mode Active" };
    }
  },

  async getUserById(id: string) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    } catch (e) { return null; }
  },

  async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
      if (error) return null;
      return data;
    } catch (e) { return null; }
  },

  async getProfiles(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Failed to fetch profiles:", e);
      return [];
    }
  },

  async updateProfileRole(id: string, role: 'admin' | 'student') {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);
    if (error) throw error;
  },

  // Whitelist Management
  async getAdminWhitelist(): Promise<string[]> {
    const { data, error } = await supabase.from('admin_whitelist').select('email');
    if (error) return [];
    return data.map(d => d.email);
  },

  async addToAdminWhitelist(email: string) {
    const { error } = await supabase.from('admin_whitelist').insert({ email: email.toLowerCase() });
    if (error && !error.message.includes('duplicate key')) throw error;
  },

  async removeFromAdminWhitelist(email: string) {
    const { error } = await supabase.from('admin_whitelist').delete().eq('email', email.toLowerCase());
    if (error) throw error;
  },

  // Academic Progress
  async getSubjects(userId: string): Promise<Subject[]> {
    try {
      const { data: subjects, error: sError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (sError) return [];
      if (!subjects || subjects.length === 0) return [];
      
      const { data: items, error: iError } = await supabase
        .from('study_items')
        .select('*')
        .eq('user_id', userId) 
        .in('subject_id', subjects.map(s => s.id));
      
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
          progressPercent: i.progress_percent || 0,
          logs: []
        }))
      }));
    } catch (e) { return []; }
  },

  async createSubject(userId: string, name: string, category: string) {
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name, category, user_id: userId })
      .select('id');
    
    if (error) throw error;
    return data?.[0]?.id;
  },

  async deleteSubject(userId: string, id: string) {
    await supabase.from('subjects').delete().eq('id', id).eq('user_id', userId);
  },

  async createItem(userId: string, subjectId: string, item: any) {
    const solved = item.exercisesSolved || 0;
    const total = Math.max(1, item.totalExercises || 1);
    const calculatedPercent = Math.round((solved / total) * 100);
    const status = calculatedPercent === 100 ? 'completed' : calculatedPercent > 0 ? 'in-progress' : 'not-started';

    const { data, error } = await supabase.from('study_items').insert({
      user_id: userId,
      subject_id: subjectId,
      title: item.title,
      type: item.type,
      status: status,
      exercises_solved: solved,
      total_exercises: total
    }).select('id');

    if (error) {
      console.error("Supabase creation error:", error);
      throw error;
    }
    
    const newId = data?.[0]?.id;
    if (!newId) throw new Error("Registry entry succeeded but no ID was returned.");
    
    return newId;
  },

  async updateItem(userId: string, itemId: string, updates: any) {
    const payload: any = {};
    if (updates.exercisesSolved !== undefined) payload.exercises_solved = updates.exercisesSolved;
    if (updates.totalExercises !== undefined) payload.total_exercises = updates.totalExercises;
    if (updates.status !== undefined) payload.status = updates.status;

    const { error } = await supabase
      .from('study_items')
      .update(payload)
      .eq('id', itemId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async deleteItem(userId: string, itemId: string) {
    await supabase.from('study_items').delete().eq('id', itemId).eq('user_id', userId);
  },

  // Semester Averages Persistence
  async saveSemesterAverage(userId: string, semesterName: string, average: number) {
    const { error } = await supabase
      .from('student_grades')
      .upsert({
        user_id: userId,
        semester_name: semesterName,
        average: average,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, semester_name' });
    
    if (error) throw error;
  },

  async getSemesterAverage(userId: string, semesterName: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('student_grades')
      .select('average')
      .eq('user_id', userId)
      .eq('semester_name', semesterName)
      .maybeSingle();
    
    if (error) return null;
    return data?.average || null;
  },

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
    return {
      ...data,
      dateAdded: new Date(data.date_added).toLocaleDateString()
    };
  },

  async deleteFile(id: string) {
    await supabase.from('file_resources').delete().eq('id', id);
  },

  async saveVisualization(userId: string, viz: any) {
    const { data, error } = await supabase.from('visualizations').insert({
      user_id: userId,
      prompt: viz.prompt,
      video_url: viz.video_url,
      aspect_ratio: viz.aspect_ratio,
      resolution: viz.resolution
    }).select().single();
    if (error) throw error;
    return data;
  },

  async getVisualizations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('visualizations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) { return []; }
  },

  async createLog(userId: string, itemId: string, log: any) {
    await supabase.from('study_logs').insert({
      user_id: userId,
      item_id: itemId,
      note: log.note,
      exercises_added: log.exercises_added || 0,
      timestamp: log.timestamp
    });
  },

  async saveChatMessage(userId: string, role: string, content: string) {
    try {
      await supabase.from('chat_history').insert({ role, content, user_id: userId });
    } catch (e) {}
  },

  async getChatHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      return data || [];
    } catch (e) { return []; }
  },

  // To-Do List Management
  async getTasks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) { return []; }
  },

  async createTask(userId: string, title: string) {
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: userId, title, completed: false })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTask(userId: string, taskId: string, updates: any) {
    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async deleteTask(userId: string, taskId: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Study Analytics
  async getStudySessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) { return []; }
  },

  async createStudySession(userId: string, subjectId: string | null, durationSeconds: number) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, subject_id: subjectId, duration_seconds: durationSeconds })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
