import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
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
import { Music, Users, Calendar, MapPin, LogOut, Search, ArrowLeft, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientDetailModal from "@/components/admin/ClientDetailModal";

type ProfileWithRequests = {
  id: string;
  user_id: string;
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
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [profiles, setProfiles] = useState<ProfileWithRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ProfileWithRequests | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllProfiles();
    }
  }, [isAdmin]);

  const fetchAllProfiles = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setProfiles(data || []);
    }
    
    setLoading(false);
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
  
  const upcomingEvents = filteredProfiles.filter(
    (p) => p.event_date && new Date(p.event_date) >= today
  );
  const pastEvents = filteredProfiles.filter(
    (p) => p.event_date && new Date(p.event_date) < today
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
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
                View and manage all client events and music selections
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Button variant="hero" onClick={() => navigate("/admin/lessons")}>
                <GraduationCap className="w-4 h-4 mr-2" />
                DJ Lessons LMS
              </Button>
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

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card variant="neon" className="mb-8">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Events ({upcomingEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventTable 
                  profiles={upcomingEvents} 
                  onClientClick={setSelectedClient} 
                />
              </CardContent>
            </Card>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card variant="glass" className="mb-8">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  Past Events ({pastEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventTable 
                  profiles={pastEvents} 
                  onClientClick={setSelectedClient}
                />
              </CardContent>
            </Card>
          )}

          {/* No Date Events */}
          {noDateEvents.length > 0 && (
            <Card variant="glass" className="mb-8">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  No Date Set ({noDateEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventTable 
                  profiles={noDateEvents} 
                  onClientClick={setSelectedClient}
                />
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
};

// Event Table Component
const EventTable = ({
  profiles,
  onClientClick,
}: {
  profiles: ProfileWithRequests[];
  onClientClick: (profile: ProfileWithRequests) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Package</TableHead>
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
              </TableCell>
              <TableCell>
                {profile.event_date
                  ? new Date(profile.event_date).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>{profile.event_type || "Not specified"}</TableCell>
              <TableCell>{profile.event_location || "Not specified"}</TableCell>
              <TableCell>{profile.package_name || "Not selected"}</TableCell>
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

export default AdminDashboard;
