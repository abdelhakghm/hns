
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  is_primary_admin?: boolean;
}

export type StudyItemType = 'Chapter' | 'TD' | 'TP';
export type StudyStatus = 'not-started' | 'in-progress' | 'completed';

export interface StudyLog {
  id: string;
  timestamp: string;
  note: string;
  exercises_added?: number;
}

export interface StudyItem {
  id: string;
  title: string;
  type: StudyItemType;
  status: StudyStatus;
  exercisesSolved: number;
  totalExercises: number;
  progressPercent: number;
  logs: StudyLog[];
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  items: StudyItem[];
}

export interface FileResource {
  id: string;
  title: string;
  description: string;
  category: 'Course' | 'TD' | 'Exam' | 'Correction';
  tags: string[];
  url: string;
  dateAdded: string;
  fileName?: string;
}

export type AppView = 'dashboard' | 'library' | 'focus' | 'chat' | 'vision' | 'admin';
