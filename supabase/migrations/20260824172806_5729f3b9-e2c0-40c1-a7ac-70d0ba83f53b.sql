
-- 1. Synced clients from external sites (Vibe Planner)
CREATE TABLE public.synced_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_app text NOT NULL DEFAULT 'vibe_planner',
  external_id text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  full_name text,
  phone text,
  event_date date,
  event_type text,
  venue_location text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_app, external_id)
);
CREATE INDEX idx_synced_clients_email ON public.synced_clients (lower(email));
CREATE INDEX idx_synced_clients_profile ON public.synced_clients (profile_id);

GRANT SELECT, UPDATE ON public.synced_clients TO authenticated;
GRANT ALL ON public.synced_clients TO service_role;
ALTER TABLE public.synced_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced clients" ON public.synced_clients
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));
CREATE POLICY "Admins can relink synced clients" ON public.synced_clients
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_synced_clients_updated
  BEFORE UPDATE ON public.synced_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Synced music
CREATE TABLE public.synced_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  request_type text NOT NULL DEFAULT 'additional',
  song_title text NOT NULL,
  artist text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_music TO authenticated;
GRANT ALL ON public.synced_music TO service_role;
ALTER TABLE public.synced_music ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced music" ON public.synced_music
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));

-- 3. Synced notes
CREATE TABLE public.synced_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  category text,
  title text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_notes TO authenticated;
GRANT ALL ON public.synced_notes TO service_role;
ALTER TABLE public.synced_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced notes" ON public.synced_notes
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));

-- 4. Synced playlists
CREATE TABLE public.synced_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text,
  provider text,
  url text,
  track_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_playlists TO authenticated;
GRANT ALL ON public.synced_playlists TO service_role;
ALTER TABLE public.synced_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced playlists" ON public.synced_playlists
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));

-- 5. Synced timeline
CREATE TABLE public.synced_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  item_time text,
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_timeline TO authenticated;
GRANT ALL ON public.synced_timeline TO service_role;
ALTER TABLE public.synced_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced timeline" ON public.synced_timeline
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));

-- 6. Synced add-ons
CREATE TABLE public.synced_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_addons TO authenticated;
GRANT ALL ON public.synced_addons TO service_role;
ALTER TABLE public.synced_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced addons" ON public.synced_addons
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));

-- 7. Synced files
CREATE TABLE public.synced_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_client_id uuid NOT NULL REFERENCES public.synced_clients(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  file_name text NOT NULL,
  url text,
  mime_type text,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (synced_client_id, external_id)
);
GRANT SELECT ON public.synced_files TO authenticated;
GRANT ALL ON public.synced_files TO service_role;
ALTER TABLE public.synced_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin area can view synced files" ON public.synced_files
  FOR SELECT TO authenticated USING (public.has_admin_area_access(auth.uid()));
