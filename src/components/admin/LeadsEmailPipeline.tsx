import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Copy, Mail, RefreshCw, Save, Trash2, CheckCheck } from "lucide-react";
import {
  DJ_PACKAGES,
  computeTotals,
  discountForPromo,
  money,
  buildEmailDraft,
  EMAIL_DRAFT_LABELS,
  type EmailDraftKey,
  type LeadPricing,
} from "@/lib/djPackages";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Meta = Record<string, unknown>;

const STATUSES = ["New", "Contacted", "Confirmed", "Booked", "Lost"] as const;

const metaStr = (md: Meta, key: string): string =>
  typeof md[key] === "string" ? (md[key] as string) : "";
const metaNum = (md: Meta, key: string): number | null =>
  typeof md[key] === "number" ? (md[key] as number) : null;

const LeadsEmailPipeline = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editable per-lead working state
  const [status, setStatus] = useState<string>("New");
  const [packageId, setPackageId] = useState<string>("");
  const [packagePrice, setPackagePrice] = useState<string>("0");
  const [discountPct, setDiscountPct] = useState<string>("0");
  const [depositPct, setDepositPct] = useState<string>("50");
  const [customTotal, setCustomTotal] = useState<string>("");
  const [draftKey, setDraftKey] = useState<EmailDraftKey>("thankyou");
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Could not load leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  // When a lead is picked, load its saved working state (or sensible defaults)
  useEffect(() => {
    if (!selected) return;
    const md = (selected.metadata ?? {}) as Meta;
    const promo = metaStr(md, "promo_code");
    setStatus(metaStr(md, "status") || "New");
    setPackageId(metaStr(md, "package_id"));
    const savedPrice = metaNum(md, "package_price");
    const pkg = DJ_PACKAGES.find((p) => p.id === metaStr(md, "package_id"));
    setPackagePrice(String(savedPrice ?? pkg?.price ?? 0));
    const savedDisc = metaNum(md, "discount_pct");
    setDiscountPct(String(savedDisc ?? discountForPromo(promo) ?? 0));
    const savedDep = metaNum(md, "deposit_pct");
    setDepositPct(String(savedDep ?? 50));
    const savedCustom = metaNum(md, "custom_total");
    setCustomTotal(savedCustom != null ? String(savedCustom) : "");
    setDraftKey("thankyou");
  }, [selected]);

  const pricing: LeadPricing = useMemo(
    () => ({
      packagePrice: parseFloat(packagePrice) || 0,
      customTotal: customTotal.trim() === "" ? null : parseFloat(customTotal) || null,
      discountPct: parseFloat(discountPct) || 0,
      depositPct: parseFloat(depositPct) || 0,
    }),
    [packagePrice, customTotal, discountPct, depositPct],
  );
  const totals = useMemo(() => computeTotals(pricing), [pricing]);
  const pkg = useMemo(
    () => DJ_PACKAGES.find((p) => p.id === packageId) ?? null,
    [packageId],
  );

  const saveLead = async (extra: Meta = {}, silent = false) => {
    if (!selected) return false;
    setSaving(true);
    const md: Meta = {
      ...((selected.metadata ?? {}) as Meta),
      status,
      package_id: packageId || null,
      package_price: parseFloat(packagePrice) || 0,
      discount_pct: parseFloat(discountPct) || 0,
      deposit_pct: parseFloat(depositPct) || 0,
      custom_total: customTotal.trim() === "" ? null : parseFloat(customTotal) || null,
      ...extra,
    };
    const { error } = await supabase.from("leads").update({ metadata: md }).eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    setLeads((prev) =>
      prev.map((l) => (l.id === selected.id ? { ...l, metadata: md as Lead["metadata"] } : l)),
    );
    if (!silent) toast({ title: "Lead saved", description: `${selected.name} — ${status}` });
    return true;
  };

  const deleteLead = async () => {
    if (!selected) return;
    const { error } = await supabase.from("leads").delete().eq("id", selected.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== selected.id));
    setSelectedId(null);
    toast({ title: "Lead deleted" });
  };

  const draft = useMemo(
    () => (selected ? buildEmailDraft(draftKey, selected, pkg, pricing) : null),
    [selected, draftKey, pkg, pricing],
  );
  const sentMap = (selected?.metadata as Meta | null)?.emails_sent as
    | Record<string, string>
    | undefined;

  const copyDraft = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
      toast({ title: "Draft copied", description: "Paste it into any email client to send." });
    } catch {
      toast({ title: "Copy failed", description: "Select the text and copy manually.", variant: "destructive" });
    }
  };

  const markSent = async () => {
    if (!selected || !draft) return;
    const next = { ...(sentMap ?? {}), [draftKey]: new Date().toISOString() };
    await saveLead({ emails_sent: next }, true);
    toast({ title: "Marked as sent", description: EMAIL_DRAFT_LABELS[draftKey] });
  };

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Leads & Email Pipeline
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Every inquiry form on the site saves here. Pick a lead, set the package and
            numbers — everything recomputes — then copy a ready-to-send email draft.
            Nothing is ever sent automatically.
          </p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading leads…</p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leads yet. New inquiries from the contact / pricing-guide forms will appear here.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {leads.map((lead) => {
                const md = (lead.metadata ?? {}) as Meta;
                const st = metaStr(md, "status") || "New";
                const promo = metaStr(md, "promo_code");
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedId(lead.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedId === lead.id
                        ? "border-primary/60 bg-primary/10"
                        : "border-white/10 bg-card/50 hover:border-white/25"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <span className="font-medium text-white">{lead.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleString("en-CA")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{lead.email}</span>
                      {lead.phone && <span>· {lead.phone}</span>}
                      <span>· {lead.service_interest}</span>
                      {promo && <Badge variant="outline" className="border-primary/40 text-primary">{promo}</Badge>}
                      <Badge variant="outline">{st}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <>
          <Card variant="glass">
            <CardHeader>
              <CardTitle>
                {selected.name} — quote & numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="text-white">{selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p>
                  {selected.message && <p className="text-muted-foreground mt-2 whitespace-pre-wrap">“{selected.message}”</p>}
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Package</label>
                  <Select
                    value={packageId}
                    onValueChange={(v) => {
                      setPackageId(v);
                      const p = DJ_PACKAGES.find((x) => x.id === v);
                      if (p) setPackagePrice(String(p.price));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a package" /></SelectTrigger>
                    <SelectContent>
                      {DJ_PACKAGES.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.group} — {p.name} ({money(p.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Package price ($) — editable</label>
                  <Input type="number" min="0" step="0.01" value={packagePrice} onChange={(e) => setPackagePrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Custom total ($) — overrides package price</label>
                  <Input type="number" min="0" step="0.01" value={customTotal} onChange={(e) => setCustomTotal(e.target.value)} placeholder="Special deal total" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Discount % (FIRST15 = 15, RETURN20 = 20)</label>
                  <Input type="number" min="0" max="100" step="0.5" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Deposit % (default 50)</label>
                  <Input type="number" min="0" max="100" step="1" value={depositPct} onChange={(e) => setDepositPct(e.target.value)} />
                </div>
              </div>
              {pkg?.note && <p className="text-xs text-muted-foreground">Package note: {pkg.note}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  ["Price", money(totals.base)],
                  [`Discount ${pricing.discountPct}%`, `−${money(totals.discountAmount)}`],
                  ["Subtotal", money(totals.subtotal)],
                  ["HST 13%", money(totals.hst)],
                  ["TOTAL", money(totals.total)],
                  [`Deposit due ${pricing.depositPct}%`, money(totals.depositDue)],
                  ["Balance", money(totals.balance)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-card/50 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-display font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="hero" onClick={() => saveLead()} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save lead"}
                </Button>
                <Button variant="outline" onClick={deleteLead}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete lead
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Email drafts — review, copy, send yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(EMAIL_DRAFT_LABELS) as EmailDraftKey[]).map((k) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={draftKey === k ? "hero" : "outline"}
                    onClick={() => setDraftKey(k)}
                  >
                    {EMAIL_DRAFT_LABELS[k]}
                    {sentMap?.[k] ? <CheckCheck className="w-3.5 h-3.5 ml-1.5 text-emerald-400" /> : null}
                  </Button>
                ))}
              </div>
              {draft && (
                <>
                  <p className="text-sm"><span className="text-muted-foreground">Subject:</span> <span className="text-white font-medium">{draft.subject}</span></p>
                  <Textarea value={draft.body} readOnly rows={16} className="font-mono text-xs leading-relaxed" />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="hero" onClick={copyDraft}>
                      <Copy className="w-4 h-4 mr-2" /> Copy draft
                    </Button>
                    <Button variant="outline" onClick={markSent} disabled={saving}>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      {sentMap?.[draftKey] ? "Sent ✓ (mark again)" : "Mark as sent"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drafts use the numbers above — edit the numbers first, then copy. Sending is
                    manual on purpose: paste into your email, review, and send.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LeadsEmailPipeline;
