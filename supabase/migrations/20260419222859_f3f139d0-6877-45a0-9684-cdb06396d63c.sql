-- ============ TABLES ============

CREATE TABLE public.lesson_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_number int NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.lesson_modules(id) ON DELETE CASCADE,
  lesson_number int NOT NULL,
  title text NOT NULL,
  description text,
  youtube_url text,
  youtube_video_id text,
  additional_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, lesson_number)
);
CREATE INDEX idx_lesson_lessons_module ON public.lesson_lessons(module_id);

CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');

CREATE TABLE public.lesson_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lesson_lessons(id) ON DELETE CASCADE,
  question_order int NOT NULL DEFAULT 1,
  question_text text NOT NULL,
  question_type public.question_type NOT NULL DEFAULT 'multiple_choice',
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lesson_questions_lesson ON public.lesson_questions(lesson_id);

CREATE TABLE public.lesson_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.lesson_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lesson_answers_question ON public.lesson_answers(question_id);

CREATE TABLE public.lesson_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lesson_access_user ON public.lesson_access(user_id);

CREATE TYPE public.lesson_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lesson_lessons(id) ON DELETE CASCADE,
  status public.lesson_status NOT NULL DEFAULT 'not_started',
  video_watched boolean NOT NULL DEFAULT false,
  quiz_score numeric(5,2),
  quiz_attempts int NOT NULL DEFAULT 0,
  student_notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);

CREATE TABLE public.lesson_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lesson_lessons(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.lesson_questions(id) ON DELETE CASCADE,
  selected_answer_id uuid REFERENCES public.lesson_answers(id) ON DELETE SET NULL,
  short_answer_text text,
  is_correct boolean NOT NULL DEFAULT false,
  attempt_number int NOT NULL DEFAULT 1,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_attempts_user_lesson ON public.lesson_quiz_attempts(user_id, lesson_id);

-- ============ HELPER FUNCTION ============

CREATE OR REPLACE FUNCTION public.has_lesson_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lesson_access
    WHERE user_id = _user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- ============ RLS ============

ALTER TABLE public.lesson_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- modules: students with access OR admins read; admins write
CREATE POLICY "Granted users and admins can view modules" ON public.lesson_modules
  FOR SELECT USING (public.has_lesson_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage modules" ON public.lesson_modules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- lessons
CREATE POLICY "Granted users and admins can view lessons" ON public.lesson_lessons
  FOR SELECT USING (public.has_lesson_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage lessons" ON public.lesson_lessons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- questions
CREATE POLICY "Granted users and admins can view questions" ON public.lesson_questions
  FOR SELECT USING (public.has_lesson_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage questions" ON public.lesson_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- answers
CREATE POLICY "Granted users and admins can view answers" ON public.lesson_answers
  FOR SELECT USING (public.has_lesson_access(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage answers" ON public.lesson_answers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- lesson_access: user sees own; admins manage all
CREATE POLICY "Users view their own access" ON public.lesson_access
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage access" ON public.lesson_access
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- progress: user manages own; admins read all
CREATE POLICY "Users view own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage progress" ON public.lesson_progress
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- quiz attempts: user inserts/views own; admins read all
CREATE POLICY "Users view own attempts" ON public.lesson_quiz_attempts
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own attempts" ON public.lesson_quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage attempts" ON public.lesson_quiz_attempts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TRIGGERS ============

CREATE TRIGGER trg_lesson_modules_updated BEFORE UPDATE ON public.lesson_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lesson_lessons_updated BEFORE UPDATE ON public.lesson_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lesson_questions_updated BEFORE UPDATE ON public.lesson_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lesson_access_updated BEFORE UPDATE ON public.lesson_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED: 24 modules ============

INSERT INTO public.lesson_modules (module_number, title, description) VALUES
  (1,  'DJ Fundamentals', 'What a DJ does, the role, history of DJing, and what to expect from this course.'),
  (2,  'DJ Equipment 101', 'Controllers, mixers, CDJs, turntables, headphones, speakers, and laptops.'),
  (3,  'Setting Up Your DJ Software', 'Installing and configuring Serato, Rekordbox, Traktor, or Virtual DJ.'),
  (4,  'Music Library Management', 'Building, organizing, tagging, and analyzing your music library.'),
  (5,  'Understanding Music Theory for DJs', 'Beats, bars, phrases, BPM, and song structure.'),
  (6,  'Beatmatching Basics', 'Manual beatmatching by ear and pitch control fundamentals.'),
  (7,  'Mixing Theory', 'Energy curves, transitions, and the art of blending two songs.'),
  (8,  'EQ and Filters', 'Using low/mid/high EQs and filters for clean mixes.'),
  (9,  'Phrasing and Song Structure', 'Mixing on the right bar so transitions feel musical.'),
  (10, 'Harmonic Mixing', 'Camelot wheel, key detection, and mixing in key.'),
  (11, 'Cue Points and Hot Cues', 'Setting, using, and performing with cue points.'),
  (12, 'Loops and Loop Rolls', 'Manual loops, auto loops, and creative loop performance.'),
  (13, 'Effects (FX)', 'Reverb, delay, echo, filter sweeps, and tasteful FX use.'),
  (14, 'Sampling and Acapellas', 'Layering samples, drops, and acapellas over instrumentals.'),
  (15, 'Genre Deep Dive: Open Format', 'Top 40, Hip-Hop, House, Latin, Reggae, and crossover techniques.'),
  (16, 'Reading the Crowd', 'Energy management, requests, and dancefloor psychology.'),
  (17, 'Wedding and Event DJing', 'Timeline management, MCing, and ceremony/cocktail/reception flow.'),
  (18, 'Mobile DJ Setup and Logistics', 'Load-in, cabling, power, lighting, and tear-down.'),
  (19, 'Microphone Skills and MCing', 'Voice technique, announcements, and crowd interaction.'),
  (20, 'Recording and Live-Streaming Sets', 'Recording mixes, streaming on Twitch/YouTube, and audio quality.'),
  (21, 'Building Your DJ Brand', 'Name, logo, photos, social media, and DPK (digital press kit).'),
  (22, 'Marketing and Booking Gigs', 'Networking, promoters, venues, and converting leads.'),
  (23, 'DJ Business: Contracts and Pricing', 'Pricing packages, deposits, contracts, invoicing, and taxes.'),
  (24, 'Advanced Performance and Career Growth', 'Producing, residencies, festivals, and the long-term career path.');

-- 10 placeholder lessons per module
INSERT INTO public.lesson_lessons (module_id, lesson_number, title, description)
SELECT m.id, gs.n, 'Lesson ' || gs.n || ' — Coming Soon', 'Add YouTube video and quiz content here.'
FROM public.lesson_modules m
CROSS JOIN generate_series(1, 10) AS gs(n);