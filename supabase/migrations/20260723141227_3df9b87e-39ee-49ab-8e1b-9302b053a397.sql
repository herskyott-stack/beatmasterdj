
ALTER TABLE public.contest_entries
  ADD COLUMN IF NOT EXISTS interested_package_category text,
  ADD COLUMN IF NOT EXISTS interested_package_name text,
  ADD COLUMN IF NOT EXISTS interested_package_price numeric,
  ADD COLUMN IF NOT EXISTS is_winner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS winner_announced_at timestamptz,
  ADD COLUMN IF NOT EXISTS ip_hash text;

CREATE INDEX IF NOT EXISTS contest_entries_ip_hash_created_at_idx
  ON public.contest_entries (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS contest_entries_email_idx
  ON public.contest_entries (lower(email));
