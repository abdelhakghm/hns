
import { User } from '../types';

// LocalStorage Keys
const STORAGE_KEYS = {
  AVERAGES: 'hns_averages'
};

// Helper for localStorage
const local = {
  get: (key: string, defaultValue: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage Limit reached', e);
    }
  }
};

// In-Memory Repository
const store = {
  averages: local.get(STORAGE_KEYS.AVERAGES, {}) as Record<string, number>
};

const persist = () => {
  local.set(STORAGE_KEYS.AVERAGES, store.averages);
};

export const db = {
  async testConnection() {
    return { success: true, message: "Academic Matrix Node: Connected" };
  },

  // Semester Averages Persistence
  async saveSemesterAverage(userId: string, semesterName: string, average: number) {
    const key = `${userId}_${semesterName}`;
    store.averages[key] = average;
    persist();
  },

  async getSemesterAverage(userId: string, semesterName: string): Promise<number | null> {
    const key = `${userId}_${semesterName}`;
    return store.averages[key] || null;
  }
};
