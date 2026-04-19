import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
};
type Access = {
  user_id: string;
  is_active: boolean;
  expires_at: string | null;
};

const StudentAccessManager = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [access, setAccess] = useState<Record<string, Access>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: ps }, { data: ac }] = await Promise.all([
      supabase.from("profiles").select("id, user_id, first_name, last_name, email").order("first_name"),
      supabase.from("lesson_access").select("user_id, is_active, expires_at"),
    ]);
    setProfiles((ps as Profile[]) || []);
    const map: Record<string, Access> = {};
    (ac || []).forEach((a: any) => { map[a.user_id] = a; });
    setAccess(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (userId: string, on: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const adminId = session?.user.id;
    const existing = access[userId];
    if (existing) {
      const { error } = await supabase
        .from("lesson_access")
        .update({ is_active: on })
        .eq("user_id", userId);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase
        .from("lesson_access")
        .insert({ user_id: userId, is_active: on, granted_by: adminId });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    toast({ title: on ? "Access granted" : "Access revoked" });
    load();
  };

  const setExpiry = async (userId: string, value: string) => {
    const expires_at = value ? new Date(value).toISOString() : null;
    await supabase.from("lesson_access").update({ expires_at }).eq("user_id", userId);
    load();
  };

  const filtered = profiles.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(s) ||
      p.last_name.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s)
    );
  });

  if (loading) return <p className="text-muted-foreground">Loading clients…</p>;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="grid gap-3">
        {filtered.map((p) => {
          const a = access[p.user_id];
          const isOn = !!a?.is_active;
          return (
            <Card key={p.id}>
              <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <p className="font-medium">
                    {p.first_name} {p.last_name}
                    {isOn && <Badge className="ml-2" variant="default">Active</Badge>}
                    {!isOn && a && <Badge className="ml-2" variant="secondary">Inactive</Badge>}
                  </p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground">Expires</label>
                    <Input
                      type="date"
                      className="w-44"
                      defaultValue={a?.expires_at ? a.expires_at.split("T")[0] : ""}
                      onBlur={(e) => setExpiry(p.user_id, e.target.value)}
                      disabled={!a}
                    />
                  </div>
                  <Switch checked={isOn} onCheckedChange={(v) => toggle(p.user_id, v)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No clients match.</p>}
      </div>
    </div>
  );
};

export default StudentAccessManager;
