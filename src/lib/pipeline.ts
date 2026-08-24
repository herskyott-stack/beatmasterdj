export const PIPELINE_STAGES = [
  "Interest Received",
  "First Touch",
  "Client Meeting",
  "Deposit Paid",
  "Final Payment Paid",
  "Event Preparation",
  "Wedding Completed",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const stageAccentClass = (stage: string) => {
  switch (stage) {
    case "Interest Received":
      return "border-white/15 text-muted-foreground";
    case "First Touch":
      return "border-sky-400/40 text-sky-300";
    case "Client Meeting":
      return "border-violet-400/40 text-violet-300";
    case "Deposit Paid":
      return "border-amber-400/40 text-amber-300";
    case "Final Payment Paid":
      return "border-emerald-400/40 text-emerald-300";
    case "Event Preparation":
      return "border-primary/40 text-primary";
    case "Wedding Completed":
      return "border-secondary/40 text-secondary";
    default:
      return "border-white/15 text-muted-foreground";
  }
};

export const isPipelineStage = (value: string): value is PipelineStage =>
  (PIPELINE_STAGES as readonly string[]).includes(value);
