import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, FileIcon, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LessonFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
};

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LessonFilesManager = ({ lessonId }: { lessonId: string }) => {
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_files")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });
    setFiles((data as LessonFile[]) || []);
  };

  useEffect(() => { load(); }, [lessonId]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast({ title: "Not signed in", variant: "destructive" });

    setUploading(true);
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_BYTES) {
        toast({ title: "Too large", description: `${file.name} exceeds 20 MB.`, variant: "destructive" });
        continue;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${lessonId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("lesson-files")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        continue;
      }
      const { error: dbErr } = await supabase.from("lesson_files").insert({
        lesson_id: lessonId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null,
        uploaded_by: user.id,
      });
      if (dbErr) {
        await supabase.storage.from("lesson-files").remove([path]);
        toast({ title: "Save failed", description: dbErr.message, variant: "destructive" });
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast({ title: "Uploaded", description: "Files saved." });
    load();
  };

  const download = async (f: LessonFile) => {
    const { data, error } = await supabase.storage
      .from("lesson-files")
      .createSignedUrl(f.file_path, 60);
    if (error || !data) return toast({ title: "Error", description: error?.message, variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (f: LessonFile) => {
    if (!confirm(`Delete ${f.file_name}?`)) return;
    await supabase.storage.from("lesson-files").remove([f.file_path]);
    await supabase.from("lesson_files").delete().eq("id", f.id);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
          {uploading ? "Uploading…" : "Upload files"}
        </Button>
        <span className="text-xs text-muted-foreground">Max 20 MB each</span>
      </div>

      {files.length === 0 ? (
        <p className="text-xs text-muted-foreground">No files attached yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-background/40 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{f.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(f.file_size)}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => download(f)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(f)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonFilesManager;
