import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LessonFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const LessonFilesList = ({ lessonId }: { lessonId: string }) => {
  const [files, setFiles] = useState<LessonFile[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lesson_files")
        .select("id,file_name,file_path,file_size")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false });
      setFiles((data as LessonFile[]) || []);
    })();
  }, [lessonId]);

  const download = async (f: LessonFile) => {
    const { data, error } = await supabase.storage
      .from("lesson-files")
      .createSignedUrl(f.file_path, 60);
    if (error || !data) return toast({ title: "Error", description: error?.message, variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  if (files.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="font-semibold mb-3">Resources</p>
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
              <Button size="sm" variant="outline" onClick={() => download(f)}>
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default LessonFilesList;
