ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'Interest Received',
  ADD COLUMN IF NOT EXISTS pipeline_stage_updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.profiles
SET pipeline_stage = CASE
  WHEN payment_status = 'Paid in Full' THEN 'Final Payment Paid'
  WHEN payment_status = 'Deposit Paid' THEN 'Deposit Paid'
  ELSE 'Interest Received'
END
WHERE pipeline_stage = 'Interest Received';

CREATE OR REPLACE FUNCTION public.pipeline_stage_rank(_stage text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _stage
    WHEN 'Interest Received' THEN 1
    WHEN 'First Touch' THEN 2
    WHEN 'Client Meeting' THEN 3
    WHEN 'Deposit Paid' THEN 4
    WHEN 'Final Payment Paid' THEN 5
    WHEN 'Event Preparation' THEN 6
    WHEN 'Wedding Completed' THEN 7
    ELSE 1
  END
$$;

CREATE OR REPLACE FUNCTION public.sync_pipeline_stage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target text;
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    NEW.pipeline_stage_updated_at = now();
    RETURN NEW;
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    target := CASE NEW.payment_status
      WHEN 'Paid in Full' THEN 'Final Payment Paid'
      WHEN 'Deposit Paid' THEN 'Deposit Paid'
      ELSE NULL
    END;
    IF target IS NOT NULL
       AND public.pipeline_stage_rank(target) > public.pipeline_stage_rank(NEW.pipeline_stage) THEN
      NEW.pipeline_stage = target;
      NEW.pipeline_stage_updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pipeline_stage ON public.profiles;
CREATE TRIGGER trg_sync_pipeline_stage
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_pipeline_stage();

REVOKE EXECUTE ON FUNCTION public.pipeline_stage_rank(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sync_pipeline_stage() FROM PUBLIC, anon;