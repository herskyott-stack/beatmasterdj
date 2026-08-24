import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

export type NewClientDefaults = Partial<{
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_date: string;
  event_type: string;
  event_location: string;
  package_name: string;
  notes: string;
}>;

interface Props {
  onCreated?: (profileId: string) => void;
  defaults?: NewClientDefaults;
  trigger?: React.ReactNode;
}

const blank = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  event_date: "",
  event_type: "",
  event_location: "",
  package_name: "",
  notes: "",
};

const AddClientDialog = ({ onCreated, defaults, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...blank, ...defaults });

  const set = (k: keyof typeof blank, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      toast({
        title: "Missing info",
        description: "First name, last name and email are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        event_date: form.event_date || null,
        event_type: form.event_type.trim() || null,
        event_location: form.event_location.trim() || null,
        package_name: form.package_name.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select("id")
      .single();
    setSaving(false);

    if (error) {
      toast({ title: "Could not add client", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Client added" });
    setForm({ ...blank, ...defaults });
    setOpen(false);
    onCreated?.(data!.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="hero">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a client</DialogTitle>
          <DialogDescription>
            Creates a new client record. Existing clients and their data are never touched.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>First name *</Label>
            <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Last name *</Label>
            <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Event date</Label>
            <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Event type</Label>
            <Input value={form.event_type} onChange={(e) => set("event_type", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Package</Label>
            <Input value={form.package_name} onChange={(e) => set("package_name", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Venue / location</Label>
            <Input value={form.event_location} onChange={(e) => set("event_location", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Add client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
