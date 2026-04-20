import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, Video } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

type Props = {
  lessonId: string;
  currentPath: string | null;
  onChange: (newPath: string | null) => void;
};

const LessonVideoUploader = ({ lessonId, currentPath, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      return toast({ title: "Not a video", description: "Please choose an MP4 or WebM file.", variant: "destructive" });
    }
    if (file.size > MAX_BYTES) {
      return toast({ title: "Too large", description: "Max 200 MB for direct video upload. Use YouTube for longer files.", variant: "destructive" });
    }
    setUploading(true);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `videos/${lessonId}/${Date.now()}-${safe}`;

    if (currentPath) {
      await supabase.storage.from("lesson-videos").remove([currentPath]);
    }

    const { error: upErr } = await supabase.storage
      .from("lesson-videos")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      setUploading(false);
      return toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
    }
    const { error: dbErr } = await supabase
      .from("lesson_lessons")
      .update({ video_file_path: path })
      .eq("id", lessonId);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (dbErr) return toast({ title: "Save failed", description: dbErr.message, variant: "destructive" });
    onChange(path);
    toast({ title: "Video uploaded", description: "Students will see your uploaded video instead of YouTube." });
  };

  const remove = async () => {
    if (!currentPath) return;
    if (!confirm("Delete this uploaded video?")) return;
    await supabase.storage.from("lesson-videos").remove([currentPath]);
    await supabase.from("lesson_lessons").update({ video_file_path: null }).eq("id", lessonId);
    onChange(null);
    toast({ title: "Removed" });
  };

  return (
    <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Video className="w-4 h-4 text-primary" /> Upload your own video file
      </div>
      <p className="text-xs text-muted-foreground">
        MP4 or WebM, up to 200 MB. If uploaded, this plays instead of YouTube.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0] || null)}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
          {uploading ? "Uploading…" : currentPath ? "Replace video" : "Upload video"}
        </Button>
        {currentPath && (
          <Button size="sm" variant="destructive" onClick={remove}>
            <Trash2 className="w-3 h-3 mr-1" /> Delete uploaded video
          </Button>
        )}
      </div>
      {currentPath && (
        <p className="text-xs text-primary">✓ Uploaded video active</p>
      )}
    </div>
  );
};

export default LessonVideoUploader;
