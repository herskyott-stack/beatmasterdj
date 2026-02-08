import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Only this email can access admin dashboard
const ADMIN_EMAIL = "hersky.ott@gmail.com";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // Check if user email matches admin email
      const userEmail = session.user.email?.toLowerCase();
      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Also verify user has admin role in database
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!roleData);
      }
      
      setLoading(false);
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading, userId };
};
