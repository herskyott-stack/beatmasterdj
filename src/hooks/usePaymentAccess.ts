import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "finance_manager" | "assistant" | null;

/**
 * Resolves the signed-in user's staff role from the database.
 * Owner/admin => full access, finance_manager => payment editing, assistant => read-only.
 */
export const usePaymentAccess = () => {
  const [role, setRole] = useState<StaffRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error loading staff role:", error);
        setRole(null);
      } else {
        const roles = (data || []).map((r) => r.role as string);
        if (roles.includes("admin")) setRole("admin");
        else if (roles.includes("finance_manager")) setRole("finance_manager");
        else if (roles.includes("assistant")) setRole("assistant");
        else setRole(null);
      }
      setLoading(false);
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    loading,
    canViewPayments: role === "admin" || role === "finance_manager" || role === "assistant",
    canEditPayments: role === "admin" || role === "finance_manager",
    isOwner: role === "admin",
  };
};
