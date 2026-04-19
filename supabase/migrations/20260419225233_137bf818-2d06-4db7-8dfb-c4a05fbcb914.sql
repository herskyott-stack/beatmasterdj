-- Create lesson_files table
CREATE TABLE public.lesson_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lesson_lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_files_lesson ON public.lesson_files(lesson_id);

ALTER TABLE public.lesson_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage lesson files"
  ON public.lesson_files FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Granted users and admins can view lesson files"
  ON public.lesson_files FOR SELECT
  USING (has_lesson_access(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Create private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Admins can view lesson files in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files' AND (has_role(auth.uid(), 'admin'::app_role) OR has_lesson_access(auth.uid())));

CREATE POLICY "Admins can upload lesson files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lesson-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lesson files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lesson-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lesson files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lesson-files' AND has_role(auth.uid(), 'admin'::app_role));