CREATE OR REPLACE FUNCTION public.bulk_update_lesson_notes(_payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
  cnt integer := 0;
BEGIN
  FOR rec IN SELECT * FROM jsonb_each_text(_payload) LOOP
    UPDATE public.lesson_lessons SET additional_notes = rec.value WHERE id = rec.key::uuid;
    cnt := cnt + 1;
  END LOOP;
  RETURN cnt;
END;
$$;