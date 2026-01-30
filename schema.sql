-- ========================================================
-- HNS HUB: SECURE ACADEMIC SCHEMA
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Chapter',
  status TEXT NOT NULL DEFAULT 'not-started',
  exercises_solved INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 1,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.study_items(id) ON DELETE CASCADE,
  note TEXT,
  exercises_added INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT, 
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  aspect_ratio TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- 3. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_whitelisted BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.admin_whitelist WHERE LOWER(email) = LOWER(new.email)) INTO is_whitelisted;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE WHEN is_whitelisted THEN 'admin' ELSE 'student' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS POLICIES (CLEANED)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_resources ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies before creating to avoid 42710 error
DROP POLICY IF EXISTS "Self view" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Subject user isolation" ON public.subjects;
DROP POLICY IF EXISTS "Item user isolation" ON public.study_items;
DROP POLICY IF EXISTS "Log user isolation" ON public.study_logs;
DROP POLICY IF EXISTS "Chat user isolation" ON public.chat_history;
DROP POLICY IF EXISTS "Viz user isolation" ON public.visualizations;
DROP POLICY IF EXISTS "Library public read" ON public.file_resources;
DROP POLICY IF EXISTS "Library admin management" ON public.file_resources;

-- Create Policies
CREATE POLICY "Self view" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin full access" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Subject user isolation" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Item user isolation" ON public.study_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Log user isolation" ON public.study_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Chat user isolation" ON public.chat_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Viz user isolation" ON public.visualizations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Library public read" ON public.file_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Library admin management" ON public.file_resources FOR ALL TO authenticated USING (public.is_admin());