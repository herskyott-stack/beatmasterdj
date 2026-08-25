ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.synced_clients REPLICA IDENTITY FULL;
ALTER TABLE public.synced_music REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.synced_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.synced_music;