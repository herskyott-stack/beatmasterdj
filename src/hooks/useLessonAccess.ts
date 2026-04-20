import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLessonAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      // Admins always have access (no lesson_access row needed)
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleRow) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("lesson_access")
        .select("is_active, expires_at")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const active =
        !!data?.is_active &&
        (!data.expires_at || new Date(data.expires_at) > new Date());
      setHasAccess(active);
      setLoading(false);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => subscription.unsubscribe();
  }, []);

  return { hasAccess, loading, userId };
};
