CREATE OR REPLACE FUNCTION public.has_admin_area_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND user_id = _user_id
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
    WHERE user_id = auth.uid()
      AND user_id = _user_id
      AND role::text IN ('admin','finance_manager')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_admin_area_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_payments(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_admin_area_access(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_payments(uuid) TO authenticated, service_role;