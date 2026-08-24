import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { DollarSign, History, ShieldCheck, Save } from "lucide-react";
import { usePaymentAccess } from "@/hooks/usePaymentAccess";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  deriveStatus,
  methodBadgeClass,
  money,
  outstanding,
  statusBadgeClass,
  type PaymentFields,
} from "@/lib/payments";

type AuditRow = {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by_email: string | null;
  created_at: string;
};

const FIELD_LABELS: Record<string, string> = {
  payment_status: "Payment status",
  payment_method: "Payment method",
  deposit_amount: "Deposit amount",
  full_amount: "Full amount",
  amount_paid: "Amount paid",
  payment_timestamp: "Payment date",
  payment_notes: "Payment notes",
  payment_verified: "Verified",
};

interface Props {
  profileId: string;
  initial: PaymentFields;
  onSaved?: (fields: PaymentFields) => void;
}

const ClientPaymentPanel = ({ profileId, initial, onSaved }: Props) => {
  const { canEditPayments } = usePaymentAccess();
  const [form, setForm] = useState<PaymentFields>(initial);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AuditRow[]>([]);

  useEffect(() => setForm(initial), [initial, profileId]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("payment_audit_log")
      .select("id, field_name, old_value, new_value, changed_by_email, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.error("Error loading payment history:", error);
    else setHistory(data || []);
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const set = <K extends keyof PaymentFields>(key: K, value: PaymentFields[K]) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "amount_paid" || key === "deposit_amount" || key === "full_amount") {
        const derived = deriveStatus(
          Number(next.amount_paid) || 0,
          Number(next.deposit_amount) || 0,
          Number(next.full_amount) || 0
        );
        if (derived) next.payment_status = derived;
      }
      return next;
    });

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      deposit_amount: Number(form.deposit_amount) || 0,
      full_amount: Number(form.full_amount) || 0,
      amount_paid: Number(form.amount_paid) || 0,
      payment_timestamp: form.payment_timestamp || null,
      payment_notes: form.payment_notes || null,
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", profileId);
    setSaving(false);

    if (error) {
      toast({ title: "Could not save payment", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Payment updated" });
    onSaved?.(payload);
    loadHistory();
  };

  const balance = outstanding(Number(form.full_amount) || 0, Number(form.amount_paid) || 0);

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Payment details
            <Badge variant="outline" className={`ml-auto ${statusBadgeClass(form.payment_status)}`}>
              {form.payment_status}
            </Badge>
            <Badge variant="outline" className={methodBadgeClass(form.payment_method)}>
              {form.payment_method}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.payment_status}
                onValueChange={(v) => set("payment_status", v)}
                disabled={!canEditPayments}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(v) => set("payment_method", v)}
                disabled={!canEditPayments}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deposit amount</Label>
              <Input
                type="number" min="0" step="0.01"
                value={form.deposit_amount}
                disabled={!canEditPayments}
                onChange={(e) => set("deposit_amount", e.target.value as unknown as number)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Full amount</Label>
              <Input
                type="number" min="0" step="0.01"
                value={form.full_amount}
                disabled={!canEditPayments}
                onChange={(e) => set("full_amount", e.target.value as unknown as number)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount paid</Label>
              <Input
                type="number" min="0" step="0.01"
                value={form.amount_paid}
                disabled={!canEditPayments}
                onChange={(e) => set("amount_paid", e.target.value as unknown as number)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment date</Label>
              <Input
                type="datetime-local"
                value={form.payment_timestamp ? form.payment_timestamp.slice(0, 16) : ""}
                disabled={!canEditPayments}
                onChange={(e) =>
                  set("payment_timestamp", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Payment notes</Label>
            <Textarea
              rows={3}
              value={form.payment_notes ?? ""}
              disabled={!canEditPayments}
              placeholder="E-transfer reference, cash handed over at venue, etc."
              onChange={(e) => set("payment_notes", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <Label htmlFor="verified" className="cursor-pointer">Payment verified</Label>
              <Switch
                id="verified"
                checked={form.payment_verified}
                disabled={!canEditPayments}
                onCheckedChange={(v) => set("payment_verified", v)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Outstanding balance:{" "}
              <span className={balance > 0 ? "text-amber-300 font-semibold" : "text-emerald-300 font-semibold"}>
                {money(balance)}
              </span>
            </p>
          </div>

          {canEditPayments ? (
            <Button onClick={save} disabled={saving} variant="hero">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save payment"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">View-only access — ask an owner to make changes.</p>
          )}
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Payment history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment changes recorded yet.</p>
          ) : (
            <ol className="relative border-l border-white/10 pl-4 space-y-4">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <span className="absolute -left-1 w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <p>
                    <span className="font-medium">{FIELD_LABELS[h.field_name] ?? h.field_name}</span>{" "}
                    <span className="text-muted-foreground line-through">{h.old_value ?? "empty"}</span>
                    {" → "}
                    <span className="text-primary">{h.new_value ?? "empty"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                    {h.changed_by_email ? ` · ${h.changed_by_email}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPaymentPanel;
