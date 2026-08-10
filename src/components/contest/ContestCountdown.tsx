import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = { endDate: Date; compact?: boolean };

const ContestCountdown = ({ endDate, compact = false }: Props) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, endDate.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-1 lg:flex-none flex-col items-center min-w-0 lg:min-w-[52px] rounded-lg bg-background/40 border border-primary/20 px-2 py-1.5">
      <span className="font-display text-lg md:text-xl font-bold text-primary tabular-nums">
        {pad(v)}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-1.5 w-full lg:w-auto ${compact ? "" : "md:gap-2"}`}>
      <Cell v={days} l="Days" />
      <Cell v={hours} l="Hrs" />
      <Cell v={minutes} l="Min" />
      <Cell v={seconds} l="Sec" />
    </div>
  );
};

export default ContestCountdown;
