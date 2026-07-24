
ALTER TABLE public.contest_entries
  ADD COLUMN IF NOT EXISTS email_day1_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS email_day3_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS email_day7_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS email_day14_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_day21_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_day30_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_day45_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS winner_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS loser_email_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS discount_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex');

UPDATE public.contest_entries SET unsubscribe_token = encode(gen_random_bytes(18), 'hex') WHERE unsubscribe_token IS NULL;

CREATE INDEX IF NOT EXISTS contest_entries_unsub_token_idx ON public.contest_entries(unsubscribe_token);
