import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const UploadedVideoPlayer = ({ path, onEnded }: { path: string; onEnded?: () => void }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.storage
      .from("lesson-videos")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (mounted) setUrl(data?.signedUrl || null);
      });
    return () => { mounted = false; };
  }, [path]);

  if (!url) {
    return (
      <div className="aspect-video w-full bg-black/60 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      className="w-full aspect-video rounded-lg bg-black"
      onEnded={onEnded}
    />
  );
};

export default UploadedVideoPlayer;
