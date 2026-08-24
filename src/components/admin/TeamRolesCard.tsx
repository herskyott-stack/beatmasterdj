import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, UserPlus, Trash2 } from "lucide-react";

type RoleValue = "admin" | "finance_manager" | "assistant";

const ROLE_LABELS: Record<RoleValue, string> = {
  admin: "Owner",
  finance_manager: "Finance Manager",
  assistant: "Assistant (view only)",
};

type RoleRow = { id: string; user_id: string; role: string; email?: string };

/** Owner-only panel for granting staff roles by client/account email. */
const TeamRolesCard = () => {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleValue>("assistant");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: roleRows, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error loading roles:", error);
      return;
    }
    const ids = (roleRows || []).map((r) => r.user_id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, email").in("user_id", ids)
      : { data: [] as { user_id: string; email: string }[] };
    const emailByUser = new Map((profs || []).map((p) => [p.user_id, p.email]));
    setRows((roleRows || []).map((r) => ({ ...r, email: emailByUser.get(r.user_id) })));
  };

  useEffect(() => {
    load();
  }, []);

  const grant = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("email", clean)
      .maybeSingle();

    if (!profile) {
      setBusy(false);
      toast({
        title: "No account found",
        description: "That person needs to create an account on the site first.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.user_id, role: role as never });
    setBusy(false);

    if (error) {
      toast({ title: "Could not grant role", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${ROLE_LABELS[role]} access granted` });
    setEmail("");
    load();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not revoke", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Access revoked" });
    load();
  };

  return (
    <Card variant="glass" className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Team access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="team member's account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={role} onValueChange={(v) => setRole(v as RoleValue)}>
            <SelectTrigger className="sm:w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABELS) as RoleValue[]).map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={grant} disabled={busy}>
            <UserPlus className="w-4 h-4 mr-2" /> Grant
          </Button>
        </div>

        <ul className="space-y-2">
          {rows.length === 0 && (
            <li className="text-sm text-muted-foreground">No staff roles assigned yet.</li>
          )}
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{r.email || r.user_id}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {ROLE_LABELS[r.role as RoleValue] ?? r.role}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => revoke(r.id)} aria-label="Revoke access">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TeamRolesCard;
