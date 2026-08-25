REVOKE EXECUTE ON FUNCTION public.push_client_to_planner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.push_music_to_planner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.push_client_to_planner() TO service_role;
GRANT EXECUTE ON FUNCTION public.push_music_to_planner() TO service_role;