-- ================================================================================
-- HNS HUB: PRODUCTION DATABASE ARCHITECTURE
-- Target: Supabase / PostgreSQL 15+
-- ================================================================================

-- --------------------------------------------------------------------------------
-- 1. EXTENSIONS & CLEANUP
-- --------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects to ensure a clean slate (Safe Re-runnable script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();

-- --------------------------------------------------------------------------------
-- 2. CORE TABLES
-- --------------------------------------------------------------------------------

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

-- FILE REPOSITORY: Shared academic resources (Centralized Library)
CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Course', 'TD', 'Exam', 'Correction')),
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

-- STUDY ITEMS: Specific chapters, TDs, or TPs within a subject
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL, -- Denormalized for RLS performance
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Chapter', 'TD', 'TP')),
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  exercises_solved INTEGER DEFAULT 0 CHECK (exercises_solved >= 0),
  total_exercises INTEGER DEFAULT 1 CHECK (total_exercises > 0),
  -- Generated column for consistent progress calculation across all clients
  progress_percent INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN total_exercises > 0 THEN LEAST(100, (exercises_solved * 100 / total_exercises))
      ELSE 0 
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDY LOGS: Activity tracking/history for specific items
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES public.study_items ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL, -- Denormalized for RLS performance
  note TEXT,
  exercises_added INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL, -- Application-formatted string timestamp (e.g., "12 Oct, 14:30")
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CHAT HISTORY: Persistence for HNS Assistant conversations
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- VISUALIZATIONS: Generated scientific media from Vision Lab
CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  aspect_ratio TEXT,
  resolution TEXT DEFAULT '720p',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------------
-- 3. SECURITY FUNCTIONS
-- --------------------------------------------------------------------------------

-- Helper Function: Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: Sync auth.users with public.profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    -- Bootstrap Logic: Set 'abdelhak@hns-re2sd.dz' as initial primary admin
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

-- --------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------------------

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users read themselves, Admins manage all
CREATE POLICY "profiles_owner_read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- FILE RESOURCES (Library): All authenticated students read, Admins manage
CREATE POLICY "files_read" ON public.file_resources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "files_admin_manage" ON public.file_resources FOR ALL USING (public.is_admin());

-- SUBJECTS: Owner-only access
CREATE POLICY "subjects_owner_all" ON public.subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- STUDY ITEMS: Owner-only access (Using denormalized UID for speed)
CREATE POLICY "items_owner_all" ON public.study_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- STUDY LOGS: Owner-only access (Using denormalized UID for speed)
CREATE POLICY "logs_owner_all" ON public.study_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CHAT HISTORY: Owner-only access
CREATE POLICY "chat_owner_all" ON public.chat_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- VISUALIZATIONS: Owner-only access
CREATE POLICY "viz_owner_all" ON public.visualizations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- --------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_items_subject ON public.study_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_items_user ON public.study_items(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_item ON public.study_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viz_user ON public.visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON public.file_resources(category);

-- GIN Index for rapid keyword searching in the Library tags
CREATE INDEX IF NOT EXISTS idx_files_tags ON public.file_resources USING GIN (tags);

-- --------------------------------------------------------------------------------
-- 6. TRIGGER INITIALIZATION
-- --------------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
