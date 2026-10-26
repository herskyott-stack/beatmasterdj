// DJ package catalogue + admin lead pricing math + email draft templates.
// Prices are the site's existing package prices (+13% HST) — do not change
// them here without changing the public packages pages to match.

export type DjPackage = {
  id: string;
  group: "Wedding" | "Corporate";
  name: string;
  price: number;
  note?: string;
};

export const DJ_PACKAGES: DjPackage[] = [
  { id: "wedding-essential", group: "Wedding", name: "Essential", price: 1800, note: "Reception only — the Essential package does not include ceremony coverage." },
  { id: "wedding-classic", group: "Wedding", name: "Classic", price: 2500, note: "Includes ceremony and reception coverage." },
  { id: "wedding-premium", group: "Wedding", name: "Premium", price: 3500, note: "Includes ceremony, cocktail hour, and reception coverage." },
  { id: "wedding-ultimate", group: "Wedding", name: "Ultimate", price: 5000 },
  { id: "corporate-starter", group: "Corporate", name: "Starter", price: 1800 },
  { id: "corporate-professional", group: "Corporate", name: "Professional", price: 2800 },
  { id: "corporate-executive", group: "Corporate", name: "Executive", price: 3500 },
  { id: "corporate-enterprise", group: "Corporate", name: "Enterprise", price: 5000 },
];

export const HST_RATE = 0.13;

export type LeadPricing = {
  packagePrice: number;
  customTotal: number | null;
  discountPct: number;
  depositPct: number;
};

export type ComputedTotals = {
  base: number;
  discountAmount: number;
  subtotal: number;
  hst: number;
  total: number;
  depositDue: number;
  balance: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeTotals(p: LeadPricing): ComputedTotals {
  const base = p.customTotal != null && p.customTotal > 0 ? p.customTotal : p.packagePrice;
  const discountAmount = round2((base * p.discountPct) / 100);
  const subtotal = round2(base - discountAmount);
  const hst = round2(subtotal * HST_RATE);
  const total = round2(subtotal + hst);
  const depositDue = round2((total * p.depositPct) / 100);
  const balance = round2(total - depositDue);
  return { base, discountAmount, subtotal, hst, total, depositDue, balance };
}

export const PROMO_CODES: Record<string, { discountPct: number; label: string }> = {
  FIRST15: { discountPct: 15, label: "15% off — first event booking" },
  RETURN20: { discountPct: 20, label: "20% off — second / returning event booking" },
};

export function discountForPromo(code?: string | null): number {
  if (!code) return 0;
  return PROMO_CODES[code.trim().toUpperCase()]?.discountPct ?? 0;
}

export const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

export type LeadLike = {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  service_interest?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type EmailDraftKey = "thankyou" | "confirmation" | "invoice" | "deposit" | "balance";

export const EMAIL_DRAFT_LABELS: Record<EmailDraftKey, string> = {
  thankyou: "1 · Inquiry thank-you / first reply",
  confirmation: "2 · Confirmation",
  invoice: "3 · Invoice",
  deposit: "4 · Deposit received — date secured",
  balance: "5 · Balance reminder",
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function eventLine(lead: LeadLike): string {
  const md = (lead.metadata ?? {}) as Record<string, unknown>;
  const bits: string[] = [];
  if (typeof md.event_type === "string" && md.event_type) bits.push(md.event_type);
  if (typeof md.event_date === "string" && md.event_date) bits.push(`on ${md.event_date}`);
  return bits.length ? ` (${bits.join(" ")})` : "";
}

export function buildEmailDraft(
  key: EmailDraftKey,
  lead: LeadLike,
  pkg: DjPackage | null,
  pricing: LeadPricing,
): { subject: string; body: string } {
  const t = computeTotals(pricing);
  const hi = `Hi ${firstName(lead.name)},`;
  const pkgName = pkg ? `${pkg.group} — ${pkg.name} package` : "your event package";
  const pkgNote = pkg?.note ? `\n\nPackage note: ${pkg.note}` : "";
  const sign = `\n\nThanks,\nJake Hersky — DJ Hersky / Beatmaster DJ\n(613) 837-4488 · hersky.ott@gmail.com · beatmasterdj.ca`;

  switch (key) {
    case "thankyou":
      return {
        subject: "Thanks for your inquiry — Beatmaster DJ",
        body: `${hi}\n\nThanks for reaching out about your event${eventLine(lead)} — I got your message and I'll get back to you within 24 hours with availability and a personalized quote.\n\nIf your date is coming up fast, feel free to call or text me at (613) 837-4488 and I'll jump on it right away.${sign}`,
      };
    case "confirmation":
      return {
        subject: "Your event details — next steps",
        body: `${hi}\n\nGreat news — your date is available, and I'd love to DJ your event${eventLine(lead)}.\n\nHere's what we discussed:\n• Package: ${pkgName} — ${money(t.base)} before HST${pricing.discountPct > 0 ? `\n• Discount: ${pricing.discountPct}% (−${money(t.discountAmount)})` : ""}\n• Total with 13% HST: ${money(t.total)}\n• Deposit to secure your date: ${money(t.depositDue)} (${pricing.depositPct}% of total)${pkgNote}\n\nI'll send the invoice with the full breakdown next. Once the deposit lands, your date is locked in and nobody else can book it.${sign}`,
      };
    case "invoice":
      return {
        subject: `Invoice — ${pkgName} — Beatmaster DJ`,
        body: `${hi}\n\nHere's the full breakdown for your event${eventLine(lead)}:\n\nINVOICE\n• Package: ${pkgName}\n• Package price: ${money(t.base)}${pricing.discountPct > 0 ? `\n• Discount (${pricing.discountPct}%): −${money(t.discountAmount)}\n• Discounted subtotal: ${money(t.subtotal)}` : `\n• Subtotal: ${money(t.subtotal)}`}\n• HST (13%): ${money(t.hst)}\n• TOTAL: ${money(t.total)}\n• Deposit due now (${pricing.depositPct}%): ${money(t.depositDue)}\n• Balance (due before your event): ${money(t.balance)}${pkgNote}\n\nE-transfer works best — send the deposit to hersky.ott@gmail.com and reply to this email so I can match it and confirm your date is secured. Any questions, just reply here.${sign}`,
      };
    case "deposit":
      return {
        subject: "Deposit received — your date is secured 🎉",
        body: `${hi}\n\nYour deposit of ${money(t.depositDue)} is in — thank you! Your date${eventLine(lead)} is officially secured and off the market.\n\nRemaining balance: ${money(t.balance)} (due before your event — I'll send a reminder closer to the day).${pkgNote}\n\nBetween now and your event, send me your must-play songs, do-not-play list, and any announcements you'd like me to make. Can't wait.${sign}`,
      };
    case "balance":
      return {
        subject: "Quick reminder — balance for your event",
        body: `${hi}\n\nJust a friendly reminder that the remaining balance for your event${eventLine(lead)} is ${money(t.balance)}, due before your event day.\n\n• Total (with HST): ${money(t.total)}\n• Deposit paid: ${money(t.depositDue)}\n• Balance remaining: ${money(t.balance)}\n\nE-transfer to hersky.ott@gmail.com works great. Once it's in, you're all set — just show up and enjoy your night.${sign}`,
      };
  }
}
