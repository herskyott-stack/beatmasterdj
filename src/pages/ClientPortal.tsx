import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Music, Star, Plus, Trash2, Send, LogOut, Clipboard, X, Check, Shield, GraduationCap, CheckCircle2, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  REQUEST_TYPE_DESCRIPTIONS,
  EMPTY_LIST_COPY,
  requestTypeLabel,
} from "@/lib/plannerLabels";
import type { User } from "@supabase/supabase-js";

type MusicRequest = {
  id: string;
  request_type: string;
  song_title: string;
  artist: string | null;
  notes: string | null;
  created_at: string;
};

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_location: string | null;
  package_name: string | null;
};

const ClientPortal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAdminCheck();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [musicRequests, setMusicRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(false);
  
  // Form states
  const [newSong, setNewSong] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [bulkPaste, setBulkPaste] = useState("");
  const [activeTab, setActiveTab] = useState("priority");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchData(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const submittedFlagKey = (userId: string) =>
  `beatmaster_playlist_submitted_${userId}`;

  const fetchData = async (userId: string) => {
    setLoading(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
    }

    // Fetch music requests
    const { data: requestsData } = await supabase
      .from("music_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (requestsData) {
      setMusicRequests(requestsData);
    }

    // Returning visitors still see their submission confirmation.
    if (localStorage.getItem(submittedFlagKey(userId))) {
      setShowSubmittedBanner(true);
    }

    setLoading(false);
  };

  // Arriving from a fresh submit (?submitted=true): remember it, show the banner.
  useEffect(() => {
    if (searchParams.get("submitted") === "true" && user) {
      localStorage.setItem(submittedFlagKey(user.id), "1");
      setShowSubmittedBanner(true);
    }
  }, [searchParams, user]);

  const handleAddSong = async () => {
    if (!user || !newSong.trim()) {
      toast({
        title: "Missing Song",
        description: "Please enter a song title.",
        variant: "destructive",
      });
      return;
    }

    const title = newSong.trim();
    const artistName = newArtist.trim();

    // Don't let the same song sneak onto the same list twice.
    const alreadyAdded = musicRequests.some(
      (r) =>
        r.request_type === activeTab &&
        r.song_title.toLowerCase() === title.toLowerCase() &&
        (r.artist ?? "").toLowerCase() === artistName.toLowerCase()
    );
    if (alreadyAdded) {
      toast({
        title: "Already on your list",
        description: `"${title}" is already in your ${requestTypeLabel(activeTab)} list.`,
      });
      return;
    }

    const { data, error } = await supabase.from("music_requests").insert({
      user_id: user.id,
      request_type: activeTab,
      song_title: title,
      artist: artistName || null,
      notes: newNotes.trim() || null,
    }).select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add song. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setMusicRequests([data[0], ...musicRequests]);
      setNewSong("");
      setNewArtist("");
      setNewNotes("");
      toast({
        title: "Song Added!",
        description: `"${title}" has been added to your ${requestTypeLabel(activeTab)} list.`,
      });
    }
  };

  const handleBulkPaste = async () => {
    if (!user || !bulkPaste.trim()) {
      toast({
        title: "No Songs",
        description: "Please paste your playlist first.",
        variant: "destructive",
      });
      return;
    }

    // Parse the pasted content - split by newlines, and try to detect "Artist - Song" format
    const lines = bulkPaste.split("\n").filter(line => line.trim());
    const songsToAdd = lines.map(line => {
      const trimmed = line.trim();
      // Try to detect various formats
      // Format: "Artist - Song" or "Song - Artist" or just "Song"
      const dashSplit = trimmed.split(" - ");
      if (dashSplit.length >= 2) {
        return {
          user_id: user.id,
          request_type: activeTab,
          song_title: dashSplit[1].trim(),
          artist: dashSplit[0].trim(),
          notes: null,
        };
      }
      // Format: "Song by Artist"
      const bySplit = trimmed.split(" by ");
      if (bySplit.length >= 2) {
        return {
          user_id: user.id,
          request_type: activeTab,
          song_title: bySplit[0].trim(),
          artist: bySplit[1].trim(),
          notes: null,
        };
      }
      // Just the song name
      return {
        user_id: user.id,
        request_type: activeTab,
        song_title: trimmed,
        artist: null,
        notes: null,
      };
    });

    const { data, error } = await supabase
      .from("music_requests")
      .insert(songsToAdd)
      .select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add songs. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setMusicRequests([...data, ...musicRequests]);
      setBulkPaste("");
      toast({
        title: "Songs Added!",
        description: `${data.length} ${data.length === 1 ? "song has" : "songs have"} been added to your ${requestTypeLabel(activeTab)} list.`,
      });
    }
  };

  const handleDeleteSong = async (id: string) => {
    const { error } = await supabase
      .from("music_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete song.",
        variant: "destructive",
      });
      return;
    }

    setMusicRequests(musicRequests.filter(r => r.id !== id));
    toast({
      title: "Song Removed",
      description: "The song has been removed from your list.",
    });
  };

  const handleSubmitPlaylist = async () => {
    if (!user || !profile) return;

    setSubmitting(true);

    // Group songs by type
    const prioritySongs = musicRequests.filter(r => r.request_type === "priority");
    const additionalSongs = musicRequests.filter(r => r.request_type === "additional");
    const doNotPlaySongs = musicRequests.filter(r => r.request_type === "do_not_play");

    try {
      // Send email notification via edge function
      const { error: emailError } = await supabase.functions.invoke("send-music-notification", {
        body: {
          clientName: `${profile.first_name} ${profile.last_name}`,
          clientEmail: profile.email,
          eventDate: profile.event_date,
          eventLocation: profile.event_location,
          prioritySongs: prioritySongs.map(s => ({
            song_title: s.song_title,
            artist: s.artist,
            notes: s.notes,
          })),
          additionalSongs: additionalSongs.map(s => ({
            song_title: s.song_title,
            artist: s.artist,
          })),
          doNotPlaySongs: doNotPlaySongs.map(s => ({
            song_title: s.song_title,
            artist: s.artist,
          })),
        },
      });

      if (emailError) {
        console.error("Email notification error:", emailError);
        // Continue anyway, the form submission is the backup
      }

      toast({
        title: "Playlist Submitted!",
        description: "Your music selection has been sent. We'll review it and get back to you!",
      });

      // Remember the submission so the confirmation banner survives reloads.
      localStorage.setItem(submittedFlagKey(user.id), "1");
      setShowSubmittedBanner(true);

      // Navigate to success state
      navigate("/client-portal?submitted=true");
    } catch (error) {
      console.error("Error submitting playlist:", error);
      toast({
        title: "Error",
        description: "Failed to submit playlist. Please try again.",
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  const dismissSubmittedBanner = () => {
    setShowSubmittedBanner(false);
    if (user) localStorage.removeItem(submittedFlagKey(user.id));
    navigate("/client-portal");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getSongsByType = (type: string) => musicRequests.filter(r => r.request_type === type);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-4xl font-bold mb-2">
                <span className="text-foreground">Welcome, </span>
                <span className="gradient-text">{profile?.first_name}!</span>
              </h1>
              <p className="text-muted-foreground">
                {profile?.event_date 
                  ? `Event: ${new Date(profile.event_date).toLocaleDateString()}`
                  : "Manage your music requests below"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 md:mt-0 w-full md:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/lessons">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  DJ Lessons
                </Link>
              </Button>
              {isAdmin && (
                <Button variant="hero" asChild className="w-full sm:w-auto">
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Submitted confirmation banner */}
          {showSubmittedBanner && (
            <Card variant="glass" className="mb-6 border-primary/40">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <CheckCircle2 className="w-9 h-9 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Playlist sent to Beatmaster DJ!</p>
                  <p className="text-sm text-muted-foreground">
                    {musicRequests.length > 0
                      ? `Your ${musicRequests.length} ${musicRequests.length === 1 ? "song is" : "songs are"} with us — `
                      : ""}
                    DJ Hersky will review everything before your event. You can
                    keep adding songs below and hit Submit again anytime.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissSubmittedBanner}
                  className="shrink-0"
                >
                  Add more songs
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-2">
                    <Music className="w-6 h-6 text-primary" />
                    Music Requests
                  </CardTitle>
                  <CardDescription>
                    Add songs to your playlist. You can copy-paste from Spotify or Apple Music!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="priority" className="text-xs sm:text-sm px-1 sm:px-3">
                        <Star className="w-4 h-4 mr-1 hidden sm:inline" />
                        Priority
                        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] leading-none">
                          {getSongsByType("priority").length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="additional" className="text-xs sm:text-sm px-1 sm:px-3">
                        <Plus className="w-4 h-4 mr-1 hidden sm:inline" />
                        Additional
                        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] leading-none">
                          {getSongsByType("additional").length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="do_not_play" className="text-xs sm:text-sm px-1 sm:px-3">
                        <X className="w-4 h-4 mr-1 hidden sm:inline" />
                        <span className="sm:hidden">Skip</span>
                        <span className="hidden sm:inline">Do Not Play</span>
                        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] leading-none">
                          {getSongsByType("do_not_play").length}
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    <p className="text-xs text-muted-foreground flex items-start gap-1.5 mb-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      {REQUEST_TYPE_DESCRIPTIONS[activeTab]}
                    </p>

                    <div className="space-y-6">
                      {/* Add Single Song */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-sm">Add a Song</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input
                            placeholder="Song title"
                            value={newSong}
                            onChange={(e) => setNewSong(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSong();
                            }}
                            className="bg-card/50 border-white/10"
                          />
                          <Input
                            placeholder="Artist (optional)"
                            value={newArtist}
                            onChange={(e) => setNewArtist(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSong();
                            }}
                            className="bg-card/50 border-white/10"
                          />
                        </div>
                        {activeTab === "priority" && (
                          <Input
                            placeholder="Notes - e.g., 'First dance' or 'Grand entrance'"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                            className="bg-card/50 border-white/10"
                          />
                        )}
                        <Button onClick={handleAddSong} className="w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Song
                        </Button>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Bulk Paste */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-sm flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-primary" />
                          Paste from Spotify / Apple Music
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Copy your playlist and paste below. Format: "Artist - Song" or just "Song" per line.
                        </p>
                        <Textarea
                          placeholder="Paste your songs here...&#10;e.g.:&#10;Ed Sheeran - Perfect&#10;Bruno Mars - Uptown Funk&#10;Beyoncé - Love On Top"
                          value={bulkPaste}
                          onChange={(e) => setBulkPaste(e.target.value)}
                          rows={5}
                          className="bg-card/50 border-white/10"
                        />
                        <Button onClick={handleBulkPaste} variant="outline" className="w-full sm:w-auto">
                          <Clipboard className="w-4 h-4 mr-2" />
                          Add All Songs
                        </Button>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Song List */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-sm">
                          {activeTab === "priority" && "Priority Songs (Grand Entrances, Special Moments)"}
                          {activeTab === "additional" && "Additional Songs (Party & Dancing)"}
                          {activeTab === "do_not_play" && "Do Not Play List"}
                        </h3>
                        
                        {getSongsByType(activeTab).length === 0 ? (
                          <div className="text-center py-8 text-sm">
                            <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="font-medium text-foreground/80 mb-1">
                              {EMPTY_LIST_COPY[activeTab].title}
                            </p>
                            <p className="text-muted-foreground">
                              {EMPTY_LIST_COPY[activeTab].body}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {getSongsByType(activeTab).map((song) => (
                              <div
                                key={song.id}
                                className="flex items-center justify-between gap-2 p-3 bg-card/30 rounded-lg border border-white/5"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{song.song_title}</p>
                                  {song.artist && (
                                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                                  )}
                                  {song.notes && (
                                    <p className="text-xs text-primary mt-1 truncate">{song.notes}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSong(song.id)}
                                  className="text-destructive hover:text-destructive shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card variant="glass" className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Playlist Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Priority Songs</span>
                      <span className="font-medium">{getSongsByType("priority").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Additional Songs</span>
                      <span className="font-medium">{getSongsByType("additional").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Do Not Play</span>
                      <span className="font-medium">{getSongsByType("do_not_play").length}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Songs</span>
                      <span className="font-display font-bold text-primary">
                        {musicRequests.length}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleSubmitPlaylist}
                    disabled={submitting || musicRequests.length === 0}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {submitting ? "Submitting..." : "Submit Playlist"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {musicRequests.length === 0
                      ? "Add at least one song to enable the button, then submit to send your list to Beatmaster DJ."
                      : "Submit when you're done — you can always add more songs and submit again."}
                  </p>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card variant="neon">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Need help?</p>
                  <p className="font-display text-primary">(613) 837-4488</p>
                  <p className="text-sm text-muted-foreground">hersky.ott@gmail.com</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientPortal;
