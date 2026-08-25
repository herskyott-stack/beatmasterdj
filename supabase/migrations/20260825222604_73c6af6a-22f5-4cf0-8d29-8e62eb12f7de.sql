-- Outbound sync trigger: client profile changes -> Vibe Planner.
CREATE OR REPLACE FUNCTION public.push_client_to_planner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Skip sync when only payment/pipeline bookkeeping changed.
  IF TG_OP = 'UPDATE'
     AND NEW.first_name IS NOT DISTINCT FROM OLD.first_name
     AND NEW.last_name IS NOT DISTINCT FROM OLD.last_name
     AND NEW.email IS NOT DISTINCT FROM OLD.email
     AND NEW.phone IS NOT DISTINCT FROM OLD.phone
     AND NEW.event_date IS NOT DISTINCT FROM OLD.event_date
     AND NEW.event_location IS NOT DISTINCT FROM OLD.event_location
     AND NEW.event_type IS NOT DISTINCT FROM OLD.event_type
     AND NEW.package_name IS NOT DISTINCT FROM OLD.package_name
     AND NEW.notes IS NOT DISTINCT FROM OLD.notes
  THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'kind', 'client',
    'external_id', NEW.id,
    'email', NEW.email,
    'full_name', NEW.first_name || ' ' || NEW.last_name,
    'phone', NEW.phone,
    'event_date', NEW.event_date,
    'event_type', NEW.event_type,
    'venue_location', NEW.event_location,
    'package_name', NEW.package_name,
    'notes', NEW.notes
  );

  PERFORM net.http_post(
    url := 'https://atxceyzigqadmsasxags.supabase.co/functions/v1/push-to-planner',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Sync failures must never break a client save.
  RAISE WARNING 'push_client_to_planner failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_push_client_to_planner
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.push_client_to_planner();

-- Outbound sync trigger: music request changes -> Vibe Planner.
CREATE OR REPLACE FUNCTION public.push_music_to_planner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  payload jsonb;
  client_id uuid;
BEGIN
  -- Match the requester to a client profile; skip if there is none.
  SELECT id INTO client_id FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  IF client_id IS NULL THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'kind', 'music',
    'client_external_id', client_id,
    'external_id', NEW.id,
    'request_type', NEW.request_type,
    'song_title', NEW.song_title,
    'artist', NEW.artist,
    'notes', NEW.notes
  );

  PERFORM net.http_post(
    url := 'https://atxceyzigqadmsasxags.supabase.co/functions/v1/push-to-planner',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'push_music_to_planner failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_push_music_to_planner
AFTER INSERT OR UPDATE ON public.music_requests
FOR EACH ROW EXECUTE FUNCTION public.push_music_to_planner();