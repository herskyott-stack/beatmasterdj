-- Leads admin write access (applied live 2026-10-26 via Lovable Cloud SQL;
-- this file records it in the repo so the schema history matches the DB).
-- Lets signed-in admins (has_admin_area_access) persist lead status/pricing
-- from the admin Leads & Email pipeline, and delete spam/test leads.
CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE TO authenticated
USING (public.has_admin_area_access(auth.uid()))
WITH CHECK (public.has_admin_area_access(auth.uid()));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE TO authenticated
USING (public.has_admin_area_access(auth.uid()));
