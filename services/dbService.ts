
import { supabase } from './supabase.ts';
import { User, Subject, StudyItem, FileResource } from '../types';

const LOCAL_STORAGE_KEY = 'hns_local_db';

const getLocalDb = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  // Added visualizations to the default local DB structure
  return data ? JSON.parse(data) : { profiles: [], subjects: [], items: [], logs: [], files: [], chat: [], visualizations: [] };
};

const saveLocalDb = (data: any) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const db = {
  isCloudEnabled: () => true,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: "HNS Supabase Active" };
    } catch (e: any) {
      console.error("Connection test failed:", e);
      return { success: false, message: "Cloud Offline - Fallback Active" };
    }
  },

  async getUserByEmail(email: string) {
    const institutionalEmail = email.toLowerCase().trim();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', institutionalEmail)
        .single();
      
      if (data) return data;
    } catch (e) {
      console.warn("Cloud query failed for getUserByEmail:", e);
    }
    
    const local = getLocalDb();
    return local.profiles.find((p: any) => p.email === institutionalEmail) || null;
  },

  async createProfile(data: { email: string; name: string; password_hash: string; salt: string; role: string }) {
    let profile = null;

    try {
      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          email: data.email.toLowerCase(),
          full_name: data.name,
          password_hash: data.password_hash,
          salt: data.salt,
          role: data.role
        })
        .select()
        .single();
      
      if (result) profile = result;
      if (error) throw error;
    } catch (e) {
      console.error("Cloud profile creation failed:", e);
    }

    if (!profile) {
      const local = getLocalDb();
      profile = { 
        id: window.crypto.randomUUID(), 
        email: data.email.toLowerCase(), 
        full_name: data.name, 
        password_hash: data.password_hash, 
        salt: data.salt, 
        role: data.role,
        is_primary_admin: false 
      };
      local.profiles.push(profile);
      saveLocalDb(local);
    }
    return profile;
  },

  async getSubjects(userId: string): Promise<Subject[]> {
    try {
      const { data: subjects, error: sError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const { data: items, error: iError } = await supabase
        .from('study_items')
        .select('*')
        .in('subject_id', subjects?.map(s => s.id) || []);

      if (subjects) {
        return subjects.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          items: (items || [])
            .filter(i => i.subject_id === s.id)
            .map(i => ({
              id: i.id,
              title: i.title,
              type: 'Chapter',
              status: i.status,
              exercisesSolved: i.exercises_solved,
              totalExercises: i.total_exercises,
              progressPercent: i.progress_percent || 0,
              logs: []
            }))
        }));
      }
    } catch (e) {
      console.warn("Cloud fetch failed for subjects:", e);
    }

    const local = getLocalDb();
    const userSubs = local.subjects.filter((s: any) => s.user_id === userId);
    return userSubs.map((s: any) => ({
      ...s,
      items: local.items.filter((i: any) => i.subject_id === s.id).map((i: any) => ({
        ...i,
        progressPercent: Math.round((i.exercises_solved / (i.total_exercises || 1)) * 100),
        logs: local.logs.filter((l: any) => l.item_id === i.id)
      }))
    }));
  },

  async createSubject(userId: string, name: string, category: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ user_id: userId, name, category })
        .select('id')
        .single();
      
      if (data) return data.id;
    } catch (e) {
      console.error("Cloud subject creation failed:", e);
    }

    const local = getLocalDb();
    const id = window.crypto.randomUUID();
    local.subjects.push({ id, user_id: userId, name, category, created_at: new Date().toISOString() });
    saveLocalDb(local);
    return id;
  },

  async deleteSubject(id: string) {
    try {
      await supabase.from('subjects').delete().eq('id', id);
    } catch (e) {}
    const local = getLocalDb();
    local.subjects = local.subjects.filter((s: any) => s.id !== id);
    local.items = local.items.filter((i: any) => i.subject_id !== id);
    saveLocalDb(local);
  },

  async createItem(subjectId: string, item: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('study_items')
        .insert({
          subject_id: subjectId,
          title: item.title,
          type: item.type,
          status: item.status,
          exercises_solved: item.exercisesSolved,
          total_exercises: item.totalExercises
        })
        .select('id')
        .single();
      
      if (data) return data.id;
    } catch (e) {}

    const local = getLocalDb();
    const id = window.crypto.randomUUID();
    local.items.push({ 
      id, 
      subject_id: subjectId, 
      title: item.title, 
      type: item.type, 
      status: item.status, 
      exercises_solved: item.exercisesSolved, 
      total_exercises: item.totalExercises 
    });
    saveLocalDb(local);
    return id;
  },

  async deleteItem(itemId: string) {
    try {
      await supabase.from('study_items').delete().eq('id', itemId);
    } catch (e) {}
    const local = getLocalDb();
    local.items = local.items.filter((i: any) => i.id !== itemId);
    saveLocalDb(local);
  },

  async updateItem(itemId: string, updates: any) {
    try {
      await supabase
        .from('study_items')
        .update({
          exercises_solved: updates.exercisesSolved,
          status: updates.status
        })
        .eq('id', itemId);
    } catch (e) {}
    const local = getLocalDb();
    local.items = local.items.map((i: any) => {
      if (i.id === itemId) {
        return {
          ...i,
          exercises_solved: updates.exercisesSolved !== undefined ? updates.exercisesSolved : i.exercises_solved,
          status: updates.status || i.status
        };
      }
      return i;
    });
    saveLocalDb(local);
  },

  async createLog(itemId: string, log: any) {
    try {
      await supabase
        .from('study_logs')
        .insert({
          item_id: itemId,
          note: log.note,
          exercises_added: log.exercisesAdded || 0,
          timestamp: log.timestamp
        });
    } catch (e) {
      console.error("Cloud log creation failed:", e);
    }
    const local = getLocalDb();
    local.logs.push({ id: window.crypto.randomUUID(), item_id: itemId, ...log });
    saveLocalDb(local);
  },

  async getLogs(itemId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('study_logs')
        .select('*')
        .eq('item_id', itemId)
        .order('timestamp', { ascending: false });
      
      if (data) {
        return data.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          note: r.note,
          exercisesAdded: r.exercises_added
        }));
      }
    } catch (e) {}
    const local = getLocalDb();
    return local.logs.filter((l: any) => l.item_id === itemId);
  },

  async getFiles(): Promise<FileResource[]> {
    try {
      const { data, error } = await supabase
        .from('file_resources')
        .select('*')
        .order('date_added', { ascending: false });
      
      if (data) {
        return data.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          category: r.category,
          tags: r.tags || [],
          url: r.url,
          dateAdded: new Date(r.date_added).toLocaleDateString()
        }));
      }
    } catch(e) {}
    const local = getLocalDb();
    return local.files;
  },

  async createFile(file: any) {
    try {
      await supabase
        .from('file_resources')
        .insert({
          title: file.title,
          description: file.description,
          category: file.category,
          tags: file.tags || [],
          url: file.url,
          file_name: file.fileName
        });
    } catch (e) {}
    const local = getLocalDb();
    local.files.push({ id: window.crypto.randomUUID(), ...file, dateAdded: new Date().toISOString() });
    saveLocalDb(local);
  },

  async deleteFile(id: string) {
    try {
      await supabase.from('file_resources').delete().eq('id', id);
    } catch (e) {}
    const local = getLocalDb();
    local.files = local.files.filter((f: any) => f.id !== id);
    saveLocalDb(local);
  },

  async getChatHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (data) return data;
    } catch(e) {}
    const local = getLocalDb();
    return local.chat.filter((c: any) => c.user_id === userId);
  },

  async saveChatMessage(userId: string, role: string, content: string) {
    try {
      await supabase
        .from('chat_history')
        .insert({ user_id: userId, role, content });
    } catch (e) {}
    const local = getLocalDb();
    local.chat.push({ user_id: userId, role, content, created_at: new Date().toISOString() });
    saveLocalDb(local);
  },

  // Fix: Added getVisualizations for VisionGenerator support
  async getVisualizations(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('visualizations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data) return data;
    } catch (e) {
      console.warn("Cloud visualization fetch failed:", e);
    }
    const local = getLocalDb();
    return (local.visualizations || []).filter((v: any) => v.user_id === userId);
  },

  // Fix: Added saveVisualization for VisionGenerator support
  async saveVisualization(userId: string, vizData: any) {
    try {
      await supabase
        .from('visualizations')
        .insert({
          user_id: userId,
          prompt: vizData.prompt,
          video_url: vizData.video_url,
          aspect_ratio: vizData.aspect_ratio,
          resolution: vizData.resolution
        });
    } catch (e) {
      console.error("Cloud visualization save failed:", e);
    }
    const local = getLocalDb();
    if (!local.visualizations) local.visualizations = [];
    local.visualizations.push({
      id: window.crypto.randomUUID(),
      user_id: userId,
      ...vizData,
      created_at: new Date().toISOString()
    });
    saveLocalDb(local);
  }
};
