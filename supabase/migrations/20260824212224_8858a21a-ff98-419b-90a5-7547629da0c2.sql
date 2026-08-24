ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.can_edit_payments(auth.uid()));