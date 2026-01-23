
import { neon } from '@neondatabase/serverless';
import { User, Subject, StudyItem, FileResource } from '../types';

const LOCAL_STORAGE_KEY = 'hns_local_db';

// Hardcoded Production Database URL as requested by the user
const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_FIiPt1c3KxJu@ep-green-night-ahb3y6ir-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const getDbUrl = () => {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.includes('placeholder')) {
    return envUrl;
  }
  return PROD_DATABASE_URL;
};

const getLocalDb = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : { profiles: [], subjects: [], items: [], logs: [], files: [], chat: [], visualizations: [] };
};

const saveLocalDb = (data: any) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const sql = () => {
  const url = getDbUrl();
  try {
    return neon(url);
  } catch (e) {
    console.error("Neon Connection Error:", e);
    return null;
  }
};

export const db = {
  isCloudEnabled: () => true,
  
  getCloudUrl: () => getDbUrl(),
  
  async testConnection() {
    const query = sql();
    if (!query) return { success: false, message: "Connection parameters invalid" };
    try {
      await query`SELECT 1`;
      return { success: true, message: "HNS Cloud Active" };
    } catch (e: any) {
      console.error("Connection test failed:", e);
      return { success: false, message: "Cloud Offline - Fallback Active" };
    }
  },

  async getUserByEmail(email: string) {
    const query = sql();
    const institutionalEmail = email.toLowerCase().trim();
    
    if (query) {
      try {
        const result = await query`SELECT * FROM public.profiles WHERE email = ${institutionalEmail}`;
        if (result[0]) return result[0];
      } catch (e) {
        console.warn("Cloud query failed for getUserByEmail:", e);
      }
    }
    
    const local = getLocalDb();
    return local.profiles.find((p: any) => p.email === institutionalEmail) || null;
  },

  async createProfile(data: { email: string; name: string; password_hash: string; salt: string; role: string }) {
    const query = sql();
    let profile = null;

    if (query) {
      try {
        const result = await query`
          INSERT INTO public.profiles (email, full_name, password_hash, salt, role)
          VALUES (${data.email.toLowerCase()}, ${data.name}, ${data.password_hash}, ${data.salt}, ${data.role})
          RETURNING id, email, full_name, role
        `;
        profile = result[0];
      } catch (e) {
        console.error("CRITICAL: Cloud profile creation failed. This usually means the 'profiles' table is missing columns like 'password_hash' or 'salt'. Run the migration in Admin Panel > System.", e);
      }
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
    const query = sql();
    if (query) {
      try {
        const subjects = await query`SELECT * FROM public.subjects WHERE user_id = ${userId}::uuid ORDER BY created_at DESC`;
        const items = await query`
          SELECT i.* FROM public.study_items i
          JOIN public.subjects s ON s.id = i.subject_id
          WHERE s.user_id = ${userId}::uuid
        `;

        return subjects.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          items: items
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
      } catch (e) {
        console.warn("Cloud fetch failed for subjects:", e);
      }
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
    const query = sql();
    if (query) {
      try {
        const result = await query`
          INSERT INTO public.subjects (user_id, name, category)
          VALUES (${userId}::uuid, ${name}, ${category})
          RETURNING id
        `;
        return result[0].id;
      } catch (e) {
        console.error("Cloud subject creation failed. If the user profile creation failed earlier, this foreign key constraint will always fail.", e);
      }
    }

    const local = getLocalDb();
    const id = window.crypto.randomUUID();
    local.subjects.push({ id, user_id: userId, name, category, created_at: new Date().toISOString() });
    saveLocalDb(local);
    return id;
  },

  async deleteSubject(id: string) {
    const query = sql();
    if (query) {
      try {
        await query`DELETE FROM public.subjects WHERE id = ${id}::uuid`;
      } catch (e) {}
    }
    const local = getLocalDb();
    local.subjects = local.subjects.filter((s: any) => s.id !== id);
    local.items = local.items.filter((i: any) => i.subject_id !== id);
    saveLocalDb(local);
  },

  async createItem(subjectId: string, item: any): Promise<string> {
    const query = sql();
    if (query) {
      try {
        const result = await query`
          INSERT INTO public.study_items (subject_id, title, type, status, exercises_solved, total_exercises)
          VALUES (${subjectId}::uuid, ${item.title}, ${item.type}, ${item.status}, ${item.exercisesSolved}, ${item.totalExercises})
          RETURNING id
        `;
        return result[0].id;
      } catch (e) {}
    }

    const local = getLocalDb();
    const id = window.crypto.randomUUID();
    local.items.push({ 
      id, 
      subject_id: subjectId, 
      title: item.title, 
      type: item.type, 
      status: item.status, 
      exercises_solved: item.exercises_solved, 
      total_exercises: item.totalExercises 
    });
    saveLocalDb(local);
    return id;
  },

  async deleteItem(itemId: string) {
    const query = sql();
    if (query) {
      try {
        await query`DELETE FROM public.study_items WHERE id = ${itemId}::uuid`;
      } catch (e) {}
    }
    const local = getLocalDb();
    local.items = local.items.filter((i: any) => i.id !== itemId);
    saveLocalDb(local);
  },

  async updateItem(itemId: string, updates: any) {
    const query = sql();
    if (query) {
      try {
        await query`
          UPDATE public.study_items 
          SET 
            exercises_solved = COALESCE(${updates.exercisesSolved}, exercises_solved),
            status = COALESCE(${updates.status}, status)
          WHERE id = ${itemId}::uuid
        `;
      } catch (e) {}
    }
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
    const query = sql();
    if (query) {
      try {
        await query`
          INSERT INTO public.study_logs (item_id, note, exercises_added, timestamp)
          VALUES (${itemId}::uuid, ${log.note}, ${log.exercisesAdded || 0}, ${log.timestamp})
        `;
      } catch (e) {
        console.error("Cloud log creation failed:", e);
      }
    }
    const local = getLocalDb();
    local.logs.push({ id: window.crypto.randomUUID(), item_id: itemId, ...log });
    saveLocalDb(local);
  },

  async getLogs(itemId: string): Promise<any[]> {
    const query = sql();
    if (query) {
      try {
        const result = await query`SELECT * FROM public.study_logs WHERE item_id = ${itemId}::uuid ORDER BY timestamp DESC`;
        return result.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          note: r.note,
          exercisesAdded: r.exercises_added
        }));
      } catch (e) {}
    }
    const local = getLocalDb();
    return local.logs.filter((l: any) => l.item_id === itemId);
  },

  async getFiles(): Promise<FileResource[]> {
    const query = sql();
    if (query) {
      try {
        const result = await query`SELECT * FROM public.file_resources ORDER BY date_added DESC`;
        return result.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          category: r.category,
          tags: [],
          url: r.url,
          dateAdded: new Date(r.date_added).toLocaleDateString()
        }));
      } catch(e) {}
    }
    const local = getLocalDb();
    return local.files;
  },

  async createFile(file: any) {
    const query = sql();
    if (query) {
      try {
        await query`
          INSERT INTO public.file_resources (title, description, category, tags, url, file_name)
          VALUES (${file.title}, ${file.description}, ${file.category}, ${file.tags || []}, ${file.url}, ${file.fileName})
        `;
      } catch (e) {}
    }
    const local = getLocalDb();
    local.files.push({ id: window.crypto.randomUUID(), ...file, dateAdded: new Date().toISOString() });
    saveLocalDb(local);
  },

  async deleteFile(id: string) {
    const query = sql();
    if (query) {
      try {
        await query`DELETE FROM public.file_resources WHERE id = ${id}::uuid`;
      } catch (e) {}
    }
    const local = getLocalDb();
    local.files = local.files.filter((f: any) => f.id !== id);
    saveLocalDb(local);
  },

  async getChatHistory(userId: string) {
    const query = sql();
    if (query) {
      try {
        const result = await query`SELECT role, content FROM public.chat_history WHERE user_id = ${userId}::uuid ORDER BY created_at ASC`;
        return result;
      } catch(e) {}
    }
    const local = getLocalDb();
    return local.chat.filter((c: any) => c.user_id === userId);
  },

  async saveChatMessage(userId: string, role: string, content: string) {
    const query = sql();
    if (query) {
      try {
        await query`
          INSERT INTO public.chat_history (user_id, role, content)
          VALUES (${userId}::uuid, ${role}, ${content})
        `;
      } catch (e) {}
    }
    const local = getLocalDb();
    local.chat.push({ user_id: userId, role, content, created_at: new Date().toISOString() });
    saveLocalDb(local);
  },

  /**
   * Fetches video visualization history for a user.
   */
  async getVisualizations(userId: string): Promise<any[]> {
    const query = sql();
    if (query) {
      try {
        const result = await query`SELECT * FROM public.visualizations WHERE user_id = ${userId}::uuid ORDER BY created_at DESC`;
        return result;
      } catch (e) {
        console.warn("Cloud fetch failed for visualizations:", e);
      }
    }
    const local = getLocalDb();
    return (local.visualizations || []).filter((v: any) => v.user_id === userId);
  },

  /**
   * Saves a video visualization record to the database.
   */
  async saveVisualization(userId: string, data: any) {
    const query = sql();
    if (query) {
      try {
        await query`
          INSERT INTO public.visualizations (user_id, prompt, video_url, aspect_ratio, resolution)
          VALUES (${userId}::uuid, ${data.prompt}, ${data.video_url}, ${data.aspect_ratio}, ${data.resolution})
        `;
      } catch (e) {
        console.error("Cloud visualization save failed:", e);
      }
    }
    const local = getLocalDb();
    if (!local.visualizations) local.visualizations = [];
    local.visualizations.push({ 
      id: window.crypto.randomUUID(), 
      user_id: userId, 
      ...data, 
      created_at: new Date().toISOString() 
    });
    saveLocalDb(local);
  }
};