import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music,
  Star,
  Plus,
  X,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Profile = {
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

type MusicRequest = {
  id: string;
  request_type: string;
  song_title: string;
  artist: string | null;
  notes: string | null;
  created_at: string;
};

interface ClientDetailModalProps {
  client: Profile | null;
  onClose: () => void;
}

const ClientDetailModal = ({ client, onClose }: ClientDetailModalProps) => {
  const [musicRequests, setMusicRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      fetchMusicRequests(client.user_id);
    }
  }, [client]);

  const fetchMusicRequests = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("music_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching music requests:", error);
    } else {
      setMusicRequests(data || []);
    }
    setLoading(false);
  };

  const getSongsByType = (type: string) =>
    musicRequests.filter((r) => r.request_type === type);

  const downloadPDF = () => {
    if (!client) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 255);
    doc.text("HERSKY DJ & AV", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text("Event Details", pageWidth / 2, 30, { align: "center" });

    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let yPos = 45;

    doc.setFont("helvetica", "bold");
    doc.text("Client Information", 14, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;

    const clientInfo = [
      ["Name", `${client.first_name} ${client.last_name}`],
      ["Email", client.email],
      ["Phone", client.phone || "Not provided"],
      [
        "Event Date",
        client.event_date
          ? new Date(client.event_date).toLocaleDateString()
          : "Not set",
      ],
      ["Event Type", client.event_type || "Not specified"],
      ["Location", client.event_location || "Not specified"],
      ["Package", client.package_name || "Not selected"],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: clientInfo,
      theme: "plain",
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 100 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Client Notes
    if (client.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes", 14, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 6;
      
      const splitNotes = doc.splitTextToSize(client.notes, pageWidth - 28);
      doc.text(splitNotes, 14, yPos);
      yPos += splitNotes.length * 5 + 10;
    }

    // Priority Songs
    const prioritySongs = getSongsByType("priority");
    if (prioritySongs.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Priority Songs (Special Moments)", 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Song Title", "Artist", "Notes"]],
        body: prioritySongs.map((song, i) => [
          (i + 1).toString(),
          song.song_title,
          song.artist || "-",
          song.notes || "-",
        ]),
        theme: "striped",
        headStyles: { fillColor: [0, 150, 255] },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Additional Songs
    const additionalSongs = getSongsByType("additional");
    if (additionalSongs.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Additional Songs (Party/Dancing)", 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Song Title", "Artist"]],
        body: additionalSongs.map((song, i) => [
          (i + 1).toString(),
          song.song_title,
          song.artist || "-",
        ]),
        theme: "striped",
        headStyles: { fillColor: [200, 100, 200] },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Do Not Play
    const doNotPlaySongs = getSongsByType("do_not_play");
    if (doNotPlaySongs.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Do Not Play List", 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Song Title", "Artist"]],
        body: doNotPlaySongs.map((song, i) => [
          (i + 1).toString(),
          song.song_title,
          song.artist || "-",
        ]),
        theme: "striped",
        headStyles: { fillColor: [220, 50, 50] },
        styles: { fontSize: 9 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save
    const fileName = `${client.first_name}_${client.last_name}_Event_Details.pdf`;
    doc.save(fileName);
  };

  if (!client) return null;

  const prioritySongs = getSongsByType("priority");
  const additionalSongs = getSongsByType("additional");
  const doNotPlaySongs = getSongsByType("do_not_play");

  return (
    <Dialog open={!!client} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-3">
            <span className="gradient-text">
              {client.first_name} {client.last_name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Email</span>
                </div>
                <p className="mt-1 font-medium truncate">{client.email}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Phone</span>
                </div>
                <p className="mt-1 font-medium">{client.phone || "Not provided"}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Event Date</span>
                </div>
                <p className="mt-1 font-medium">
                  {client.event_date
                    ? new Date(client.event_date).toLocaleDateString()
                    : "Not set"}
                </p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Location</span>
                </div>
                <p className="mt-1 font-medium truncate">
                  {client.event_location || "Not specified"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Event Type</span>
                </div>
                <p className="mt-1 font-medium">
                  {client.event_type || "Not specified"}
                </p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Package</span>
                </div>
                <p className="mt-1 font-medium">
                  {client.package_name || "Not selected"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {client.notes && (
            <Card variant="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Client Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          <Separator className="bg-white/10" />

          {/* Music Selections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Music Selections
              </h3>
              <Button onClick={downloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Music className="w-8 h-8 animate-pulse mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Loading music...</p>
              </div>
            ) : musicRequests.length === 0 ? (
              <Card variant="glass">
                <CardContent className="py-8 text-center">
                  <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No music requests submitted yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="priority" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="priority" className="text-xs sm:text-sm">
                    <Star className="w-4 h-4 mr-1 hidden sm:inline" />
                    Priority ({prioritySongs.length})
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="text-xs sm:text-sm">
                    <Plus className="w-4 h-4 mr-1 hidden sm:inline" />
                    Additional ({additionalSongs.length})
                  </TabsTrigger>
                  <TabsTrigger value="do_not_play" className="text-xs sm:text-sm">
                    <X className="w-4 h-4 mr-1 hidden sm:inline" />
                    Do Not Play ({doNotPlaySongs.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="priority">
                  <SongList songs={prioritySongs} showNotes />
                </TabsContent>
                <TabsContent value="additional">
                  <SongList songs={additionalSongs} />
                </TabsContent>
                <TabsContent value="do_not_play">
                  <SongList songs={doNotPlaySongs} />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground pt-4 border-t border-white/10">
            <p>
              Account created: {new Date(client.created_at).toLocaleString()}
            </p>
            <p>Last updated: {new Date(client.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Song List Component
const SongList = ({
  songs,
  showNotes = false,
}: {
  songs: MusicRequest[];
  showNotes?: boolean;
}) => {
  if (songs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No songs in this category.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {songs.map((song, index) => (
        <div
          key={song.id}
          className="flex items-start gap-3 p-3 bg-card/30 rounded-lg border border-white/5"
        >
          <span className="text-muted-foreground text-sm min-w-[24px]">
            {index + 1}.
          </span>
          <div className="flex-1">
            <p className="font-medium">{song.song_title}</p>
            {song.artist && (
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            )}
            {showNotes && song.notes && (
              <p className="text-xs text-primary mt-1">{song.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientDetailModal;
