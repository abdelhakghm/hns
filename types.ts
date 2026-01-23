
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  isPrimary?: boolean;
}

export type StudyItemType = 'Chapter' | 'TD' | 'TP' | 'Project';
export type StudyStatus = 'not-started' | 'in-progress' | 'completed';

export interface StudyLog {
  id: string;
  timestamp: string;
  note: string;
  exercisesAdded?: number;
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

export interface StudySession {
  subjectId: string;
  itemId: string;
  startTime: number;
  duration: number; // in seconds
  method: 'pomodoro' | 'three-hour' | 'custom';
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

export type AppView = 'dashboard' | 'library' | 'focus' | 'chat' | 'admin';
