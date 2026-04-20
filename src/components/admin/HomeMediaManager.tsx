import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, ArrowUp, ArrowDown, Loader2, ImageIcon, Video, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Item = {
  id: string;
  type: "image" | "video";
  file_path: string;
  title: string | null;
  caption: string | null;
  display_order: number;
};

const BUCKET = "home-media";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const HomeMediaManager = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("home_media")
      .select("*")
      .order("display_order", { ascending: true });
    setItems((data as Item[]) || []);
  };

  useEffect(() => { load(); }, []);

  const publicUrl = (path: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast({ title: "Not signed in", variant: "destructive" });

    setUploading(true);
    const nextOrder = (items[items.length - 1]?.display_order ?? -1) + 1;
    let i = 0;

    for (const file of Array.from(fileList)) {
      if (file.size > MAX_BYTES) {
        toast({ title: "Too large", description: `${file.name} exceeds 50 MB.`, variant: "destructive" });
        continue;
      }
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        toast({ title: "Unsupported", description: `${file.name} must be image or video.`, variant: "destructive" });
        continue;
      }
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        continue;
      }
      const { error: dbErr } = await supabase.from("home_media").insert({
        type: isVideo ? "video" : "image",
        file_path: path,
        display_order: nextOrder + i,
        uploaded_by: user.id,
        title: file.name.replace(/\.[^.]+$/, ""),
      });
      if (dbErr) {
        await supabase.storage.from(BUCKET).remove([path]);
        toast({ title: "Save failed", description: dbErr.message, variant: "destructive" });
      }
      i++;
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast({ title: "Uploaded", description: "Media saved." });
    load();
  };

  const updateField = (id: string, patch: Partial<Item>) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const save = async (it: Item) => {
    const { error } = await supabase
      .from("home_media")
      .update({ title: it.title, caption: it.caption })
      .eq("id", it.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Saved" });
  };

  const move = async (it: Item, dir: -1 | 1) => {
    const idx = items.findIndex((x) => x.id === it.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    await supabase.from("home_media").update({ display_order: other.display_order }).eq("id", it.id);
    await supabase.from("home_media").update({ display_order: it.display_order }).eq("id", other.id);
    load();
  };

  const remove = async (it: Item) => {
    if (!confirm(`Delete this ${it.type}?`)) return;
    await supabase.storage.from(BUCKET).remove([it.file_path]);
    await supabase.from("home_media").delete().eq("id", it.id);
    load();
  };

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardContent className="pt-6 flex items-center gap-3 flex-wrap">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} variant="hero">
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? "Uploading…" : "Upload images / videos"}
          </Button>
          <span className="text-xs text-muted-foreground">
            JPG / PNG / WebP / MP4 / WebM · Max 50 MB · Shows on homepage gallery
          </span>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
            No media yet. Upload images or videos to feature them on the homepage.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((it, idx) => (
            <Card key={it.id} variant="glass">
              <CardContent className="pt-4 space-y-3">
                <div className="aspect-video w-full overflow-hidden rounded-md bg-black/40 border border-white/10">
                  {it.type === "image" ? (
                    <img src={publicUrl(it.file_path)} alt={it.title || ""} className="w-full h-full object-cover" />
                  ) : (
                    <video src={publicUrl(it.file_path)} controls className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {it.type === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span className="uppercase">{it.type}</span>
                  <span>· Order {idx + 1}</span>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={it.title || ""} onChange={(e) => updateField(it.id, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Caption</Label>
                  <Textarea
                    value={it.caption || ""}
                    onChange={(e) => updateField(it.id, { caption: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => save(it)}>
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => move(it, -1)} disabled={idx === 0}>
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => move(it, 1)} disabled={idx === items.length - 1}>
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(it)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeMediaManager;
