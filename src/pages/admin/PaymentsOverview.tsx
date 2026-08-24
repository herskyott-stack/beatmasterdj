import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentAccess } from "@/hooks/usePaymentAccess";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TeamRolesCard from "@/components/admin/TeamRolesCard";
import { ArrowLeft, Banknote, Download, Wallet, AlertTriangle, CircleDollarSign } from "lucide-react";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  methodBadgeClass,
  money,
  outstanding,
  statusBadgeClass,
} from "@/lib/payments";

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  event_date: string | null;
  event_type: string | null;
  package_name: string | null;
  payment_status: string;
  payment_method: string;
  deposit_amount: number;
  full_amount: number;
  amount_paid: number;
  payment_timestamp: string | null;
  payment_verified: boolean;
};

const PaymentsOverview = () => {
  const navigate = useNavigate();
  const { canViewPayments, isOwner, loading: accessLoading } = usePaymentAccess();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (!accessLoading && !canViewPayments) navigate("/auth");
  }, [accessLoading, canViewPayments, navigate]);

  useEffect(() => {
    if (!canViewPayments) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, event_date, event_type, package_name, payment_status, payment_method, deposit_amount, full_amount, amount_paid, payment_timestamp, payment_verified"
        )
        .order("event_date", { ascending: true });
      if (error) console.error("Error loading payments:", error);
      else setRows((data as Row[]) || []);
      setLoading(false);
    };
    load();
  }, [canViewPayments]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "all" && r.payment_status !== status) return false;
        if (method !== "all" && r.payment_method !== method) return false;
        if (from && (!r.event_date || r.event_date < from)) return false;
        if (to && (!r.event_date || r.event_date > to)) return false;
        return true;
      }),
    [rows, status, method, from, to]
  );

  const stats = useMemo(() => {
    const depositsCollected = filtered
      .filter((r) => r.payment_status === "Deposit Paid")
      .reduce((s, r) => s + Number(r.amount_paid || 0), 0);
    const fullCollected = filtered
      .filter((r) => r.payment_status === "Paid in Full")
      .reduce((s, r) => s + Number(r.amount_paid || 0), 0);
    const cash = filtered
      .filter((r) => r.payment_method === "Cash")
      .reduce((s, r) => s + Number(r.amount_paid || 0), 0);
    const etransfer = filtered
      .filter((r) => r.payment_method === "E-Transfer")
      .reduce((s, r) => s + Number(r.amount_paid || 0), 0);
    const outstandingTotal = filtered.reduce(
      (s, r) => s + outstanding(Number(r.full_amount || 0), Number(r.amount_paid || 0)),
      0
    );
    const today = new Date().toISOString().slice(0, 10);
    const upcomingUnpaid = filtered.filter(
      (r) => r.payment_status !== "Paid in Full" && r.event_date && r.event_date >= today
    );
    const overdue = filtered.filter(
      (r) => r.payment_status !== "Paid in Full" && r.event_date && r.event_date < today
    );
    return { depositsCollected, fullCollected, cash, etransfer, outstandingTotal, upcomingUnpaid, overdue };
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "Name", "Email", "Event Date", "Event Type", "Package", "Status", "Method",
      "Deposit Amount", "Full Amount", "Amount Paid", "Outstanding", "Payment Date", "Verified",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.event_date ?? "",
        r.event_type ?? "",
        r.package_name ?? "",
        r.payment_status,
        r.payment_method,
        r.deposit_amount,
        r.full_amount,
        r.amount_paid,
        outstanding(Number(r.full_amount || 0), Number(r.amount_paid || 0)),
        r.payment_timestamp ? new Date(r.payment_timestamp).toLocaleString() : "",
        r.payment_verified ? "Yes" : "No",
      ].map(esc).join(",")
    );
    const csv = [headers.map(esc).join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `beatmasterdj-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CircleDollarSign className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!canViewPayments) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Payments Overview</span>
              </h1>
              <p className="text-muted-foreground">Deposits, balances and payment methods at a glance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button variant="hero" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            <StatCard icon={<Wallet className="w-6 h-6 text-amber-300" />} label="Deposits collected" value={money(stats.depositsCollected)} />
            <StatCard icon={<CircleDollarSign className="w-6 h-6 text-emerald-300" />} label="Paid in full" value={money(stats.fullCollected)} />
            <StatCard icon={<Banknote className="w-6 h-6 text-primary" />} label="Cash" value={money(stats.cash)} />
            <StatCard icon={<Banknote className="w-6 h-6 text-secondary" />} label="E-Transfer" value={money(stats.etransfer)} />
            <StatCard icon={<AlertTriangle className="w-6 h-6 text-amber-300" />} label="Outstanding" value={money(stats.outstandingTotal)} />
          </div>

          <Card variant="glass" className="mb-6">
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Status</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Method</p>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Event from</p>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Event to</p>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <MiniList title={`Upcoming unpaid events (${stats.upcomingUnpaid.length})`} rows={stats.upcomingUnpaid} />
            <MiniList title={`Overdue payments (${stats.overdue.length})`} rows={stats.overdue} />
          </div>

          {isOwner && <TeamRolesCard />}

          <Card variant="neon">
            <CardHeader>
              <CardTitle className="font-display text-xl">All payments ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Event date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                        <TableCell>{r.event_date ? new Date(r.event_date).toLocaleDateString() : "Not set"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadgeClass(r.payment_status)}>{r.payment_status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={methodBadgeClass(r.payment_method)}>{r.payment_method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{money(Number(r.amount_paid || 0))}</TableCell>
                        <TableCell className="text-right">{money(Number(r.full_amount || 0))}</TableCell>
                        <TableCell className="text-right">
                          {money(outstanding(Number(r.full_amount || 0), Number(r.amount_paid || 0)))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No payments match these filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card variant="glass">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MiniList = ({ title, rows }: { title: string; rows: Row[] }) => (
  <Card variant="glass">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here — all clear.</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 6).map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm gap-3">
              <span className="truncate">{r.first_name} {r.last_name}</span>
              <span className="text-muted-foreground whitespace-nowrap">
                {r.event_date ? new Date(r.event_date).toLocaleDateString() : "No date"} ·{" "}
                {money(outstanding(Number(r.full_amount || 0), Number(r.amount_paid || 0)))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default PaymentsOverview;
