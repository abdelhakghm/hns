
-- ========================================================
-- HNS HUB: COMPLETE ACADEMIC SCHEMA (Supabase compatible)
-- ========================================================

-- 1. PROFILES (Reference table for users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ACADEMIC AVERAGES
-- Stores the semester averages (e.g. 'L2-S1') for each student.
CREATE TABLE IF NOT EXISTS public.academic_averages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL, -- e.g. 'L1-S1', 'L2-S2' (The "Average of what?")
  average NUMERIC CHECK (average >= 0 AND average <= 20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_key)
);

-- 3. MISSION REGISTRY (To-Do Tasks)
CREATE TABLE IF NOT EXISTS public.mission_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ANALYTICS (Study Sessions)
CREATE TABLE IF NOT EXISTS public.study_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS POLICIES (Security)
ALTER TABLE public.academic_averages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only interact with their own data
CREATE POLICY "Manage own averages" ON public.academic_averages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own registry" ON public.mission_registry FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own analytics" ON public.study_analytics FOR ALL USING (auth.uid() = user_id);
