
-- ==========================================
-- HNS HUB: DATABASE RECOVERY & DEBUG SCHEMA
-- Target: Fix Foreign Key Blocker (Auth-Bypass)
-- ==========================================

-- 1. DROP BLOCKING CONSTRAINTS
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE IF EXISTS public.subjects DROP CONSTRAINT IF EXISTS subjects_user_id_fkey;
ALTER TABLE IF EXISTS public.study_items DROP CONSTRAINT IF EXISTS study_items_user_id_fkey;
ALTER TABLE IF EXISTS public.study_logs DROP CONSTRAINT IF EXISTS study_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.chat_history DROP CONSTRAINT IF EXISTS chat_history_user_id_fkey;

-- 2. ENSURE TABLES EXIST (Safe Definitions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES: Academic identities
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SUBJECTS: Academic modules (Solar, Wind, etc)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDY ITEMS: TD, TP, or Chapters
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Chapter',
  status TEXT NOT NULL DEFAULT 'not-started',
  exercises_solved INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 1,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDY LOGS: History of effort
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE,
  note TEXT,
  exercises_added INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- FILE RESOURCES: Library materials
CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  file_name TEXT,
  date_added TIMESTAMPTZ DEFAULT now()
);

-- CHAT HISTORY: AI Interactions
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DISABLE RLS (Security Bypass for Debug)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history DISABLE ROW LEVEL SECURITY;

-- 4. FORCE MOCK USER DATA
INSERT INTO public.profiles (id, full_name, email, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'HNS Debug Scholar', 'debug@hns-re2sd.dz', 'admin')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
