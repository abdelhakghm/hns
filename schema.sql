-- --- HNS STUDENT COMPANION DATABASE SCHEMA ---
-- Optimized for the Supabase SQL Editor

-- 1. ENUMS (Custom Types for Data Integrity)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE study_item_type AS ENUM ('Chapter', 'TD', 'TP', 'Project');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE study_status AS ENUM ('not-started', 'in-progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE file_category AS ENUM ('Course', 'TD', 'Exam', 'Correction');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- Profiles: Extends Supabase Auth users with roles and domain enforcement
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'student',
  is_primary_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT domain_check CHECK (email LIKE '%@hns-re2sd.dz')
);

-- Subjects: Personal academic modules for each student
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Study Items: Chapters or TDs within a subject
CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type study_item_type DEFAULT 'Chapter',
  status study_status DEFAULT 'not-started',
  exercises_solved INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progress calculation at the database layer
ALTER TABLE public.study_items 
ADD COLUMN IF NOT EXISTS progress_percent INTEGER 
GENERATED ALWAYS AS (
  CASE WHEN total_exercises > 0 
  THEN LEAST(100, (exercises_solved * 100 / total_exercises)) 
  ELSE 0 END
) STORED;

-- Study Logs: History of progress updates
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  exercises_added INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- File Resources: Global repository managed by admins
CREATE TABLE IF NOT EXISTS public.file_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category file_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  url TEXT NOT NULL,
  file_name TEXT,
  date_added DATE DEFAULT CURRENT_DATE,
  added_by UUID REFERENCES public.profiles(id)
);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_resources ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subject Policies (Strictly isolated by user_id)
CREATE POLICY "Users manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);

-- Item Policies (Linked to subject ownership)
CREATE POLICY "Users manage own items" ON public.study_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.subjects WHERE id = study_items.subject_id AND user_id = auth.uid())
);

-- Log Policies (Linked to item ownership)
CREATE POLICY "Users manage own logs" ON public.study_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.study_items i 
    JOIN public.subjects s ON i.subject_id = s.id 
    WHERE i.id = study_logs.item_id AND s.user_id = auth.uid()
  )
);

-- Global Resource Policies (Selectable by any authenticated HNS user, modified only by admins)
CREATE POLICY "Authenticated users can browse repository" ON public.file_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify repository" ON public.file_resources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. AUTOMATION: AUTH SYNC
-- Automatically create a profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_primary_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    -- Automatically assign Admin role to the primary developer
    CASE WHEN new.email = 'abdelhak@hns-re2sd.dz' THEN 'admin'::user_role ELSE 'student'::user_role END,
    CASE WHEN new.email = 'abdelhak@hns-re2sd.dz' THEN true ELSE false END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to link auth.users to public.profiles
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null; END $$;