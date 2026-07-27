
ALTER TABLE public.contest_entries
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_entry_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_day7_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_winner_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS sms_final_sent_at timestamptz;
