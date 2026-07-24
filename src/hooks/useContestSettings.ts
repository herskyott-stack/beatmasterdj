import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContestSettings = {
  id: string;
  contest_name: string;
  start_date: string;
  end_date: string;
  auto_stop_enabled: boolean;
  winner_entry_id: string | null;
  announcement_date: string | null;
};

const TZ = "America/Toronto";

export const formatContestDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));

export const formatContestDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export function isContestActiveFrom(s: ContestSettings | null): boolean {
  if (!s) return false;
  const now = Date.now();
  const start = new Date(s.start_date).getTime();
  const end = new Date(s.end_date).getTime();
  if (s.auto_stop_enabled) return now >= start && now <= end;
  return now >= start; // still open if auto-stop is off
}

let cache: ContestSettings | null = null;

export function useContestSettings() {
  const [settings, setSettings] = useState<ContestSettings | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("contest_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (mounted && data) {
        cache = data as ContestSettings;
        setSettings(cache);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading, isActive: isContestActiveFrom(settings) };
}
