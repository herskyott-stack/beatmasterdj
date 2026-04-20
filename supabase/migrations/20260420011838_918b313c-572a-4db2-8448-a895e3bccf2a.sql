
-- 1. home_media table
CREATE TABLE public.home_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  file_path TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view home media"
  ON public.home_media FOR SELECT
  USING (true);

CREATE POLICY "Admins manage home media"
  ON public.home_media FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_home_media_updated_at
  BEFORE UPDATE ON public.home_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_home_media_order ON public.home_media(display_order);

-- 2. home-media public storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-media', 'home-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read home-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'home-media');

CREATE POLICY "Admins upload home-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'home-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update home-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'home-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete home-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'home-media' AND has_role(auth.uid(), 'admin'::app_role));

-- 3. lesson video upload column
ALTER TABLE public.lesson_lessons
  ADD COLUMN video_file_path TEXT;

-- 4. lesson-videos private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Granted users and admins read lesson-videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lesson-videos'
    AND (has_lesson_access(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins upload lesson-videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lesson-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update lesson-videos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lesson-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete lesson-videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lesson-videos' AND has_role(auth.uid(), 'admin'::app_role));
