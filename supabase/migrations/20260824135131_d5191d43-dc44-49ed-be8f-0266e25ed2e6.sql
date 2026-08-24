-- 1. New roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistant';

-- 2. Payment columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS deposit_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS full_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_timestamp timestamptz,
  ADD COLUMN IF NOT EXISTS payment_notes text,
  ADD COLUMN IF NOT EXISTS payment_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_payment_status_check,
  DROP CONSTRAINT IF EXISTS profiles_payment_method_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_payment_status_check CHECK (payment_status IN ('Pending','Deposit Paid','Paid in Full')),
  ADD CONSTRAINT profiles_payment_method_check CHECK (payment_method IN ('None','Cash','E-Transfer'));

-- 3. Role helpers (text comparison so new enum labels are usable immediately)
CREATE OR REPLACE FUNCTION public.has_admin_area_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin','finance_manager','assistant')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_payments(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin','finance_manager')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_admin_area_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_payments(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_admin_area_access(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_payments(uuid) TO authenticated, service_role;

-- 4. Staff access to profiles
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_admin_area_access(auth.uid()));

DROP POLICY IF EXISTS "Finance staff can update profiles" ON public.profiles;
CREATE POLICY "Finance staff can update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.can_edit_payments(auth.uid()))
WITH CHECK (public.can_edit_payments(auth.uid()));

-- 5. Audit log
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changed_by uuid,
  changed_by_email text,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_audit_log_profile_idx ON public.payment_audit_log(profile_id, created_at DESC);

GRANT SELECT ON public.payment_audit_log TO authenticated;
GRANT ALL ON public.payment_audit_log TO service_role;

ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view payment audit log" ON public.payment_audit_log;
CREATE POLICY "Staff can view payment audit log"
ON public.payment_audit_log FOR SELECT TO authenticated
USING (public.has_admin_area_access(auth.uid()));

-- 6. Trigger that records every payment field change
CREATE OR REPLACE FUNCTION public.log_payment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  actor_email text;
  f text;
  oldv text;
  newv text;
BEGIN
  SELECT email INTO actor_email FROM auth.users WHERE id = actor;

  FOREACH f IN ARRAY ARRAY['payment_status','payment_method','deposit_amount','full_amount','amount_paid','payment_timestamp','payment_notes','payment_verified'] LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', f, f)
      INTO oldv, newv USING OLD, NEW;
    IF oldv IS DISTINCT FROM newv THEN
      INSERT INTO public.payment_audit_log (profile_id, changed_by, changed_by_email, field_name, old_value, new_value)
      VALUES (NEW.id, actor, actor_email, f, oldv, newv);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_payment_changes ON public.profiles;
CREATE TRIGGER trg_log_payment_changes
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_payment_changes();