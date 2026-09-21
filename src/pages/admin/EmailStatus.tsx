import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Copy, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

type DnsResult = {
  allGreen: boolean;
  txt: { host: string; expected: string; found: string[]; ok: boolean };
  ns: { host: string; expected: string[]; found: string[]; ok: boolean };
  checkedAt: string;
};

type LogRow = {
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string | null;
  error_message: string | null;
  created_at: string;
};

const StatusPill = ({ ok }: { ok: boolean }) =>
  ok ? (
    <Badge className="bg-green-600 hover:bg-green-600 text-white">
      <CheckCircle2 className="w-3 h-3 mr-1" /> Detected
    </Badge>
  ) : (
    <Badge className="bg-red-600 hover:bg-red-600 text-white">
      <XCircle className="w-3 h-3 mr-1" /> Missing
    </Badge>
  );

const copy = (v: string) => {
  navigator.clipboard.writeText(v);
  toast.success("Copied");
};

export default function EmailStatus() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [dns, setDns] = useState<DnsResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/auth");
  }, [adminLoading, isAdmin, navigate]);

  const runCheck = useCallback(async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-dns-status");
      if (error) throw error;
      setDns(data as DnsResult);
    } catch (e: any) {
      toast.error("DNS check failed: " + (e?.message ?? String(e)));
    } finally {
      setChecking(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from("email_send_log")
      .select("message_id, template_name, recipient_email, status, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    // Dedupe by message_id (latest wins)
    const seen = new Set<string>();
    const deduped: LogRow[] = [];
    for (const r of (data ?? []) as LogRow[]) {
      const key = r.message_id ?? `${r.recipient_email}-${r.created_at}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(r);
      if (deduped.length >= 10) break;
    }
    setLogs(deduped);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    runCheck();
    loadLogs();
    const t = setInterval(() => {
      runCheck();
      loadLogs();
    }, 30_000);
    return () => clearInterval(t);
  }, [isAdmin, runCheck, loadLogs]);

  const sendTest = async (target: "customer" | "admin") => {
    const recipient = target === "admin" ? "hersky.ott@gmail.com" : testEmail.trim();
    if (target === "customer" && !recipient) {
      toast.error("Enter a test email first");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: { target, recipientEmail: recipient },
      });
      if (error) throw error;
      toast.success(`Sent to ${recipient}`);
      setTimeout(loadLogs, 1500);
    } catch (e: any) {
      toast.error("Send failed: " + (e?.message ?? String(e)));
    } finally {
      setSending(false);
    }
  };

  if (adminLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
        </Button>
        <h1 className="text-3xl font-bold mb-2">Email DNS & Delivery Status</h1>
        <p className="text-muted-foreground mb-6">
          Live DNS check for <code>notify.beatmasterdj.ca</code>. Once all 3 records show
          Detected, emails will start delivering.
        </p>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>DNS Checklist</CardTitle>
            <div className="flex items-center gap-2">
              {dns && (
                <Badge variant={dns.allGreen ? "default" : "secondary"}>
                  {dns.allGreen ? "All records verified" : "Waiting on records"}
                </Badge>
              )}
              <Button size="sm" variant="outline" onClick={runCheck} disabled={checking}>
                <RefreshCw className={`w-4 h-4 mr-2 ${checking ? "animate-spin" : ""}`} />
                Re-check
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!dns && <p className="text-sm text-muted-foreground">Checking…</p>}
            {dns && (
              <>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">TXT record</div>
                      <div className="font-mono text-sm break-all">{dns.txt.host}</div>
                    </div>
                    <StatusPill ok={dns.txt.ok} />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Expected value:</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
                      {dns.txt.expected}
                    </code>
                    <Button size="icon" variant="ghost" onClick={() => copy(dns.txt.expected)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {dns.txt.found.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Found: {dns.txt.found.join(", ")}
                    </div>
                  )}
                </div>

                {dns.ns.expected.map((ns) => {
                  const found = dns.ns.found.includes(ns);
                  return (
                    <div key={ns} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs uppercase text-muted-foreground">NS record</div>
                          <div className="font-mono text-sm break-all">{dns.ns.host}</div>
                        </div>
                        <StatusPill ok={found} />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">Expected value:</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded flex-1">{ns}</code>
                        <Button size="icon" variant="ghost" onClick={() => copy(ns)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(dns.checkedAt).toLocaleTimeString()} · Auto-refreshes
                  every 30s.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Send Test Emails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!dns?.allGreen && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                DNS not fully verified yet — test sends will queue but will likely fail with
                domain_not_verified until all 3 records are detected.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button onClick={() => sendTest("customer")} disabled={sending}>
                <Send className="w-4 h-4 mr-2" /> Send customer test
              </Button>
              <Button
                variant="secondary"
                onClick={() => sendTest("admin")}
                disabled={sending}
              >
                <Send className="w-4 h-4 mr-2" /> Send admin notification
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Email Log</CardTitle>
            <Button size="sm" variant="outline" onClick={loadLogs}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No email activity yet.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((r) => {
                  const color =
                    r.status === "sent"
                      ? "bg-green-600"
                      : r.status === "pending"
                      ? "bg-amber-600"
                      : r.status === "suppressed"
                      ? "bg-yellow-600"
                      : "bg-red-600";
                  return (
                    <div
                      key={(r.message_id ?? "") + r.created_at}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 border rounded p-3 text-sm"
                    >
                      <Badge className={`${color} hover:${color} text-white capitalize w-fit`}>
                        {r.status ?? "unknown"}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.template_name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.recipient_email}
                        </div>
                        {r.error_message && (
                          <div className="text-xs text-red-500 truncate mt-1">
                            {r.error_message}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
