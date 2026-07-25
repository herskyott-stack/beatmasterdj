DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'contest-drip-followups') THEN
    PERFORM cron.unschedule('contest-drip-followups');
  END IF;
END $$;

SELECT cron.schedule(
  'contest-drip-followups',
  '*/15 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://atxceyzigqadmsasxags.supabase.co/functions/v1/send-contest-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'email_queue_service_role_key'
        LIMIT 1
      )
    ),
    body := '{"type":"run_followups"}'::jsonb
  );
  $cron$
);