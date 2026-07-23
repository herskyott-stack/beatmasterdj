
CREATE TABLE public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contest_id TEXT NOT NULL DEFAULT 'summer-tech-dj-2026',
  source_page TEXT NOT NULL DEFAULT 'homepage',
  status TEXT NOT NULL DEFAULT 'active',
  followup_24h_sent_at TIMESTAMPTZ,
  followup_48h_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contest_entries TO authenticated;
GRANT INSERT ON public.contest_entries TO anon;
GRANT ALL ON public.contest_entries TO service_role;

ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can enter contest"
  ON public.contest_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all entries"
  ON public.contest_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update entries"
  ON public.contest_entries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete entries"
  ON public.contest_entries FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_contest_entries_updated_at
  BEFORE UPDATE ON public.contest_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contest_entries_created_at ON public.contest_entries (created_at DESC);
