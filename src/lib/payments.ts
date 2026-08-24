export const PAYMENT_STATUSES = ["Pending", "Deposit Paid", "Paid in Full"] as const;
export const PAYMENT_METHODS = ["None", "Cash", "E-Transfer"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentFields = {
  payment_status: string;
  payment_method: string;
  deposit_amount: number;
  full_amount: number;
  amount_paid: number;
  payment_timestamp: string | null;
  payment_notes: string | null;
  payment_verified: boolean;
};

export const statusBadgeClass = (status: string) => {
  switch (status) {
    case "Paid in Full":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    case "Deposit Paid":
      return "bg-amber-500/15 text-amber-300 border-amber-500/40";
    default:
      return "bg-white/5 text-muted-foreground border-white/15";
  }
};

export const methodBadgeClass = (method: string) => {
  switch (method) {
    case "Cash":
      return "bg-primary/15 text-primary border-primary/40";
    case "E-Transfer":
      return "bg-secondary/15 text-secondary border-secondary/40";
    default:
      return "bg-white/5 text-muted-foreground border-white/15";
  }
};

/** Derive status from amounts. Returns null when nothing can be inferred. */
export const deriveStatus = (
  amountPaid: number,
  depositAmount: number,
  fullAmount: number
): PaymentStatus | null => {
  if (fullAmount > 0 && amountPaid >= fullAmount) return "Paid in Full";
  if (depositAmount > 0 && amountPaid >= depositAmount) return "Deposit Paid";
  if (amountPaid <= 0) return "Pending";
  return null;
};

export const outstanding = (fullAmount: number, amountPaid: number) =>
  Math.max(0, Number((fullAmount - amountPaid).toFixed(2)));

export const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
