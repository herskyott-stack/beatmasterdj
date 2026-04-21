import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Plus, Minus, FlipHorizontal2, RotateCcw, Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Props = {
  script: string;
  filename: string;
};

const Teleprompter = ({ script, filename }: Props) => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(40); // px/sec
  const [fontSize, setFontSize] = useState(28);
  const [mirrored, setMirrored] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTs.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (!ref.current) return;
      if (lastTs.current == null) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      ref.current.scrollTop += speed * dt;
      const atBottom =
        ref.current.scrollTop + ref.current.clientHeight >= ref.current.scrollHeight - 1;
      if (atBottom) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed]);

  const reset = () => {
    if (ref.current) ref.current.scrollTop = 0;
    setPlaying(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(script);
    toast({ title: "Script copied", description: "Paste into your teleprompter app." });
  };

  const download = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={playing ? "default" : "outline"} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} title="Reset to top">
          <RotateCcw className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setFontSize((s) => Math.max(14, s - 2))} title="Smaller">
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}px</span>
        <Button size="sm" variant="outline" onClick={() => setFontSize((s) => Math.min(64, s + 2))} title="Larger">
          <Plus className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant={mirrored ? "default" : "outline"}
          onClick={() => setMirrored((m) => !m)}
          title="Mirror for teleprompter glass"
        >
          <FlipHorizontal2 className="w-3 h-3" />
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy className="w-3 h-3 mr-1" /> Copy
          </Button>
          <Button size="sm" variant="outline" onClick={download}>
            <Download className="w-3 h-3 mr-1" /> .txt
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-12">Speed</span>
        <Slider
          value={[speed]}
          min={10}
          max={150}
          step={5}
          onValueChange={(v) => setSpeed(v[0])}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-14 text-right">{speed} px/s</span>
      </div>

      <div
        ref={ref}
        className="rounded-md border border-primary/30 bg-black/70 p-4 h-[420px] overflow-y-auto"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      >
        <pre
          className="whitespace-pre-wrap font-display leading-relaxed text-foreground"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.45 }}
        >
          {script}
        </pre>
      </div>
    </div>
  );
};

export default Teleprompter;
