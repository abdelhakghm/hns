
-- ==========================================
-- HNS HUB: PRODUCTION DATABASE ARCHITECTURE
-- Target: Supabase / PostgreSQL 15+
-- Version: 2.1.3 (Idempotent Update)
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLEANUP (Safe Re-run)
-- This section ensures functions and triggers are fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. CORE TABLES

-- PROFILES: Extension of auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FILE REPOSITORY: Shared academic resources
CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Course', 'TD', 'TP', 'Exam', 'Correction')),
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  file_name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date_added TIMESTAMPTZ DEFAULT now()
);

-- SUBJECTS: Academic modules owned by individual students
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDY ITEMS: Specific chapters, TDs, or TPs
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Chapter', 'TD', 'TP')),
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  exercises_solved INTEGER DEFAULT 0 CHECK (exercises_solved >= 0),
  total_exercises INTEGER DEFAULT 1 CHECK (total_exercises > 0),
  progress_percent INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN total_exercises > 0 THEN LEAST(100, (exercises_solved * 100 / total_exercises))
      ELSE 0 
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDY LOGS: Activity tracking
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES public.study_items ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  note TEXT,
  exercises_added INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CHAT HISTORY: Persistence for AI Assistant
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VISUALIZATIONS: Generated media
CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  aspect_ratio TEXT,
  resolution TEXT DEFAULT '720p',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SECURITY & AUTH LOGIC

-- Helper: Check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
        WHEN new.email = 'abdelhak@hns-re2sd.dz' THEN 'admin'
        ELSE 'student'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user ON public.study_items(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON public.file_resources(category);

-- 6. RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;

-- CLEAN UP EXISTING POLICIES (Fixes "policy already exists" error)
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "files_read_all" ON public.file_resources;
DROP POLICY IF EXISTS "files_admin_manage" ON public.file_resources;
DROP POLICY IF EXISTS "subjects_owner" ON public.subjects;
DROP POLICY IF EXISTS "items_owner" ON public.study_items;
DROP POLICY IF EXISTS "logs_owner" ON public.study_logs;
DROP POLICY IF EXISTS "chat_owner" ON public.chat_history;
DROP POLICY IF EXISTS "viz_owner" ON public.visualizations;

-- Profiles: Self-read, Admin-all
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- Files: All-read, Admin-manage
CREATE POLICY "files_read_all" ON public.file_resources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "files_admin_manage" ON public.file_resources FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Ownership policies (Subjects, Items, Logs, Chat, Viz)
CREATE POLICY "subjects_owner" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "items_owner" ON public.study_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "logs_owner" ON public.study_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "chat_owner" ON public.chat_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "viz_owner" ON public.visualizations FOR ALL USING (auth.uid() = user_id);

-- 7. INITIALIZE TRIGGERS
-- Re-create the trigger on auth.users (handled via profiles creation logic)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
