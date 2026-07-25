
-- Drop anon INSERT — all contest inserts go through the submit-contest-entry edge function (service role)
DROP POLICY IF EXISTS "Anyone can enter contest" ON public.contest_entries;
DROP POLICY IF EXISTS "Anyone can create inquiry" ON public.contest_event_inquiries;

-- Convert helper functions used in RLS from SECURITY DEFINER to SECURITY INVOKER
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY INVOKER;
ALTER FUNCTION public.has_lesson_access(uuid) SECURITY INVOKER;
