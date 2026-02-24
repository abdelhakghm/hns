
-- ========================================================
-- HNS HUB: SEMESTER YIELD PERSISTENCE
-- ========================================================

-- 1. FINAL SEMESTER AVERAGES TABLE
-- Strictly stores ONLY the final calculated average per user per semester.
CREATE TABLE IF NOT EXISTS public.student_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  semester_name TEXT NOT NULL, -- e.g. 'Semester 1'
  average NUMERIC CHECK (average >= 0 AND average <= 20),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, semester_name)
);

-- 2. SECURITY POLICIES
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;

-- Using DROP POLICY IF EXISTS for robust idempotency
DROP POLICY IF EXISTS "Users can manage their own semester grades" ON public.student_grades;
CREATE POLICY "Users can manage their own semester grades" 
  ON public.student_grades
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. ENSURING ACADEMIC STRUCTURE ACCESSIBILITY
-- Fix for potential 42710 errors by ensuring policies are only created if they don't exist 
-- or by dropping them first.
DO $$ 
BEGIN
    -- Fix for academic_semesters
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'academic_semesters') THEN
        DROP POLICY IF EXISTS "Grades structure public read" ON public.academic_semesters;
        CREATE POLICY "Grades structure public read" ON public.academic_semesters FOR SELECT TO authenticated USING (true);
    END IF;

    -- Fix for academic_units
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'academic_units') THEN
        DROP POLICY IF EXISTS "Grades unit public read" ON public.academic_units;
        CREATE POLICY "Grades unit public read" ON public.academic_units FOR SELECT TO authenticated USING (true);
    END IF;

    -- Fix for academic_modules
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'academic_modules') THEN
        DROP POLICY IF EXISTS "Grades module public read" ON public.academic_modules;
        CREATE POLICY "Grades module public read" ON public.academic_modules FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ========================================================
-- HNS HUB: TO-DO LIST (MISSION REGISTRY)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own todos" ON public.todos;
CREATE POLICY "Users can manage their own todos" 
  ON public.todos
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- HNS HUB: STUDY ANALYTICS
-- ========================================================

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can manage their own study sessions" 
  ON public.study_sessions
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
