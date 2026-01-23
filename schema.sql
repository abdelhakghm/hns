
-- --- HNS STUDENT COMPANION: PRODUCTION MASTER SCHEMA ---
-- Target Environment: Neon PostgreSQL
-- Security Level: PBKDF2 Hashing (Client-Side) + Institutional Domain Restriction

-- Enable UUID extension for global unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TYPE DEFINITIONS (Institutional Academic Standards)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_status') THEN
        CREATE TYPE study_status AS ENUM ('not-started', 'in-progress', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_category') THEN
        CREATE TYPE file_category AS ENUM ('Course', 'TD', 'Exam', 'Correction');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. USER PROFILES
-- Enforcement: Only @hns-re2sd.dz emails are permitted at the database level.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@hns-re2sd\.dz$'),
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role user_role DEFAULT 'student',
  is_primary_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACADEMIC SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STUDY ITEMS (Chapters, TD, Projects)
-- Progress is automatically calculated via a generated column to ensure UI consistency.
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Chapter',
  status study_status DEFAULT 'not-started',
  exercises_solved INTEGER DEFAULT 0 CHECK (exercises_solved >= 0),
  total_exercises INTEGER DEFAULT 10 CHECK (total_exercises > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  progress_percent INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_exercises > 0 
    THEN LEAST(100, (exercises_solved * 100 / total_exercises)) 
    ELSE 0 END
  ) STORED
);

-- 5. STUDY ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  exercises_added INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL, -- Stored as formatted string for UI consistency
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SHARED ACADEMIC LIBRARY (Global)
CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category file_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  file_name TEXT,
  date_added DATE DEFAULT CURRENT_DATE
);

-- 7. VISION LAB VISUALIZATIONS (Veo History)
CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '16:9',
  resolution TEXT DEFAULT '720p',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. AI CHAT HISTORY (Persistent Context)
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_items_subject ON public.study_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_logs_item ON public.study_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viz_user ON public.visualizations(user_id);
