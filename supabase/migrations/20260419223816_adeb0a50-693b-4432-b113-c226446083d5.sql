ALTER TABLE public.lesson_lessons
ADD COLUMN IF NOT EXISTS quiz_group integer;

UPDATE public.lesson_lessons
SET quiz_group = CEIL(lesson_number::numeric / 5)::int
WHERE quiz_group IS NULL;

ALTER TABLE public.lesson_lessons
ALTER COLUMN quiz_group SET DEFAULT 1,
ALTER COLUMN quiz_group SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_lessons_module_quiz_group
ON public.lesson_lessons(module_id, quiz_group);