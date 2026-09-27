DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Signed-in visitors can submit a lead" ON public.leads;
CREATE POLICY "Visitors can submit a valid lead" ON public.leads
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (business_name IS NULL OR char_length(business_name) <= 200)
  AND (service_interest IS NULL OR char_length(service_interest) <= 200)
  AND (message IS NULL OR char_length(message) <= 5000)
);