
-- 1) contest_settings
CREATE TABLE IF NOT EXISTS public.contest_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_name text NOT NULL DEFAULT 'BeatmasterDJ Summer Wedding & Event Giveaway',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL DEFAULT '2026-09-02T03:59:59Z',
  auto_stop_enabled boolean NOT NULL DEFAULT true,
  winner_entry_id uuid,
  announcement_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.contest_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contest_settings TO authenticated;
GRANT ALL ON public.contest_settings TO service_role;

ALTER TABLE public.contest_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contest settings"
  ON public.contest_settings FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins manage contest settings"
  ON public.contest_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_contest_settings_updated_at
  BEFORE UPDATE ON public.contest_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed single row (only if empty)
INSERT INTO public.contest_settings (contest_name, start_date, end_date, auto_stop_enabled)
SELECT 'BeatmasterDJ Summer Wedding & Event Giveaway', now(), '2026-09-02T03:59:59Z'::timestamptz, true
WHERE NOT EXISTS (SELECT 1 FROM public.contest_settings);

-- 2) Extend contest_entries
ALTER TABLE public.contest_entries
  ADD COLUMN IF NOT EXISTS agreed_to_rules boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_inquiry_id uuid,
  ADD COLUMN IF NOT EXISTS bonus_followed_instagram boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bonus_shared_story boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bonus_tagged_account boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bonus_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS instagram_handle text;

CREATE UNIQUE INDEX IF NOT EXISTS contest_entries_email_unique
  ON public.contest_entries (lower(email));

-- Column-scoped anon UPDATE so an entrant can attach their bonus info right after entering.
-- Only the bonus columns are grantable; admin still flips bonus_verified.
GRANT UPDATE (
  bonus_followed_instagram,
  bonus_shared_story,
  bonus_tagged_account,
  instagram_handle
) ON public.contest_entries TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit bonus info" ON public.contest_entries;
CREATE POLICY "Anyone can submit bonus info"
  ON public.contest_entries FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3) contest_event_inquiries
CREATE TABLE IF NOT EXISTS public.contest_event_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES public.contest_entries(id) ON DELETE CASCADE,
  event_type text,
  event_date date,
  venue_location text,
  guest_count integer,
  special_requests text,
  interested_package_id text,
  interested_package_name text,
  interested_package_category text,
  interested_package_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contest_event_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contest_event_inquiries TO authenticated;
GRANT ALL ON public.contest_event_inquiries TO service_role;

ALTER TABLE public.contest_event_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create inquiry"
  ON public.contest_event_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins view inquiries"
  ON public.contest_event_inquiries FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage inquiries"
  ON public.contest_event_inquiries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_contest_event_inquiries_updated_at
  BEFORE UPDATE ON public.contest_event_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
