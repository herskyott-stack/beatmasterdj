import { forwardRef, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Music, Users, Calendar, MapPin, LogOut, Search, ArrowLeft, GraduationCap, ImagePlus, Trophy, Mail, CircleDollarSign, KanbanSquare, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientDetailModal from "@/components/admin/ClientDetailModal";
import PipelineBoard from "@/components/admin/PipelineBoard";
import PlannerImportPanel from "@/components/admin/PlannerImportPanel";
import AddClientDialog from "@/components/admin/AddClientDialog";
import type { PipelineStage } from "@/lib/pipeline";

import HomeMediaManager from "@/components/admin/HomeMediaManager";
import { usePaymentAccess } from "@/hooks/usePaymentAccess";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  methodBadgeClass,
  statusBadgeClass,
} from "@/lib/payments";

type ProfileWithRequests = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_location: string | null;
  event_type: string | null;
  package_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_status: string;
  payment_method: string;
  deposit_amount: number;
  full_amount: number;
  amount_paid: number;
  payment_timestamp: string | null;
  payment_notes: string | null;
  payment_verified: boolean;
  pipeline_stage: string;

};

const AdminDashboard = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const {
    canViewPayments,
    canEditPayments,
    isOwner,
    role,
    loading: adminLoading,
  } = usePaymentAccess();
  const [profiles, setProfiles] = useState<ProfileWithRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ProfileWithRequests | null>(null);

  useEffect(() => {
    if (!adminLoading && !canViewPayments) {
      navigate("/auth");
    }
  }, [adminLoading, canViewPayments, navigate]);

  const fetchAllProfiles = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("event_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Could not load clients",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (canViewPayments) fetchAllProfiles(true);
  }, [canViewPayments, fetchAllProfiles]);

  // Live updates: refresh the client list whenever a profile changes anywhere.
  useEffect(() => {
    if (!canViewPayments) return;

    const channel = supabase
      .channel("admin-profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchAllProfiles(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [canViewPayments, fetchAllProfiles]);


  const updatePipelineStage = async (profileId: string, stage: PipelineStage) => {
    const previous = profiles;
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, pipeline_stage: stage } : p))
    );

    const { error } = await supabase
      .from("profiles")
      .update({ pipeline_stage: stage })
      .eq("id", profileId);

    if (error) {
      setProfiles(previous);
      toast({ title: "Could not move client", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Moved to ${stage}` });
    }
  };

  const updatePaymentField = async (

    profileId: string,
    field: "payment_status" | "payment_method",
    value: string
  ) => {
    const previous = profiles;
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, [field]: value } : p))
    );

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", profileId);

    if (error) {
      setProfiles(previous);
      toast({
        title: "Could not save",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Payment updated" });
      // payment changes can auto-advance the pipeline stage server-side
      if (field === "payment_status") fetchAllProfiles();
    }

  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredProfiles = profiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.first_name.toLowerCase().includes(searchLower) ||
      profile.last_name.toLowerCase().includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower) ||
      (profile.event_location?.toLowerCase().includes(searchLower) ?? false) ||
      (profile.event_type?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Group profiles by event date (upcoming vs past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventDate = (value: string) => new Date(`${value}T00:00:00`);
  const upcomingEvents = filteredProfiles.filter(
    (p) => p.event_date && eventDate(p.event_date) >= today
  );
  const pastEvents = filteredProfiles.filter(
    (p) => p.event_date && eventDate(p.event_date) < today
  );
  const noDateEvents = filteredProfiles.filter((p) => !p.event_date);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!canViewPayments) {
    return null;
  }

  const roleLabel =
    role === "admin" ? "Owner" : role === "finance_manager" ? "Finance Manager" : "Assistant";

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Admin Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                View and manage all client events, payments and music selections
              </p>
              <Badge variant="outline" className="mt-2 border-primary/40 text-primary">
                Signed in as {roleLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {canEditPayments && <AddClientDialog onCreated={fetchAllProfiles} />}
              <Button variant="hero" onClick={() => navigate("/admin/payments")}>
                <CircleDollarSign className="w-4 h-4 mr-2" />
                Payments
              </Button>
              {isOwner && (
                <>
                  <Button variant="hero" onClick={() => navigate("/admin/lessons")}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    DJ Lessons LMS
                  </Button>
                  <Button variant="hero" onClick={() => navigate("/admin/contest")}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Contest Signups
                  </Button>
                  <Button variant="hero" onClick={() => navigate("/admin/email-status")}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email DNS Status
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => navigate("/client-portal")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Client Portal
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{profiles.length}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{pastEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Past Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{noDateEvents.length}</p>
                    <p className="text-sm text-muted-foreground">No Date Set</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="mb-6 flex flex-wrap h-auto">
              <TabsTrigger value="clients">
                <Users className="w-4 h-4 mr-2" /> Clients & Events
              </TabsTrigger>
              <TabsTrigger value="pipeline">
                <KanbanSquare className="w-4 h-4 mr-2" /> Pipeline
              </TabsTrigger>
              <TabsTrigger value="planner">
                <CloudDownload className="w-4 h-4 mr-2" /> Vibe Planner Import
              </TabsTrigger>
              <TabsTrigger value="home-media">
                <ImagePlus className="w-4 h-4 mr-2" /> Home Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planner">
              <PlannerImportPanel onProfilesChanged={fetchAllProfiles} />
            </TabsContent>


            <TabsContent value="pipeline">
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card/50 border-white/10"
                  />
                </div>
              </div>
              <PipelineBoard
                clients={filteredProfiles}
                canEdit={canEditPayments}
                onStageChange={updatePipelineStage}
                onOpenClient={(id) =>
                  setSelectedClient(profiles.find((p) => p.id === id) ?? null)
                }
              />
            </TabsContent>


            <TabsContent value="clients">
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card/50 border-white/10"
                  />
                </div>
              </div>

              {upcomingEvents.length > 0 && (
                <Card variant="neon" className="mb-8">
                  <CardHeader>
                    <CardTitle className="font-display text-xl flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Upcoming Events ({upcomingEvents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventTable profiles={upcomingEvents} onClientClick={setSelectedClient} canEdit={canEditPayments} onPaymentChange={updatePaymentField} />
                  </CardContent>
                </Card>
              )}

              {pastEvents.length > 0 && (
                <Card variant="glass" className="mb-8">
                  <CardHeader>
                    <CardTitle className="font-display text-xl flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      Past Events ({pastEvents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventTable profiles={pastEvents} onClientClick={setSelectedClient} canEdit={canEditPayments} onPaymentChange={updatePaymentField} />
                  </CardContent>
                </Card>
              )}

              {noDateEvents.length > 0 && (
                <Card variant="glass" className="mb-8">
                  <CardHeader>
                    <CardTitle className="font-display text-xl flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      No Date Set ({noDateEvents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventTable profiles={noDateEvents} onClientClick={setSelectedClient} canEdit={canEditPayments} onPaymentChange={updatePaymentField} />
                  </CardContent>
                </Card>
              )}

              {filteredProfiles.length === 0 && (
                <Card variant="glass">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No clients found matching your search." : "No clients yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="home-media">
              <HomeMediaManager />
            </TabsContent>
          </Tabs>

        </div>
      </main>
      <Footer />

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
});

// Event Table Component
const EventTable = ({
  profiles,
  onClientClick,
  canEdit,
  onPaymentChange,
}: {
  profiles: ProfileWithRequests[];
  onClientClick: (profile: ProfileWithRequests) => void;
  canEdit: boolean;
  onPaymentChange: (
    profileId: string,
    field: "payment_status" | "payment_method",
    value: string
  ) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow
              key={profile.id}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => onClientClick(profile)}
            >
              <TableCell className="font-medium">
                <span className="text-primary hover:underline">
                  {profile.first_name} {profile.last_name}
                </span>
                {profile.event_location && (
                  <p className="text-xs text-muted-foreground">{profile.event_location}</p>
                )}
              </TableCell>
              <TableCell>
                {profile.event_date
                  ? new Date(`${profile.event_date}T00:00:00`).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>{profile.event_type || "Not specified"}</TableCell>
              <TableCell>{profile.package_name || "Not selected"}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {canEdit ? (
                  <Select
                    value={profile.payment_status}
                    onValueChange={(v) => onPaymentChange(profile.id, "payment_status", v)}
                  >
                    <SelectTrigger className={`h-8 w-[150px] text-xs ${statusBadgeClass(profile.payment_status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={statusBadgeClass(profile.payment_status)}>
                    {profile.payment_status}
                  </Badge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {canEdit ? (
                  <Select
                    value={profile.payment_method}
                    onValueChange={(v) => onPaymentChange(profile.id, "payment_method", v)}
                  >
                    <SelectTrigger className={`h-8 w-[130px] text-xs ${methodBadgeClass(profile.payment_method)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={methodBadgeClass(profile.payment_method)}>
                    {profile.payment_method}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{profile.email}</p>
                  {profile.phone && (
                    <p className="text-muted-foreground">{profile.phone}</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

AdminDashboard.displayName = "AdminDashboard";

export default AdminDashboard;
