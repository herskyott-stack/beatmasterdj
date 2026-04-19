interface Props {
  videoId: string;
  title?: string;
}

export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const YouTubeEmbed = ({ videoId, title }: Props) => {
  if (!videoId) {
    return (
      <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
        No video assigned yet
      </div>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || "DJ lesson video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;
