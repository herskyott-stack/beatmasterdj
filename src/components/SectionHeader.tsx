import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Editorial index, e.g. "01" */
  index?: string;
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  className?: string;
  /** Heading level — defaults to h2; pass "h1" for page heroes. */
  as?: "h1" | "h2";
};

/**
 * Shared editorial section header: numbered eyebrow with a rule,
 * tight display title, balanced sub copy. Keeps every section's
 * typographic rhythm consistent.
 */
const SectionHeader = ({
  index,
  eyebrow,
  title,
  sub,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeaderProps) => {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        centered ? "text-center" : "text-left",
        className
      )}
    >
      <p
        className={cn(
          "eyebrow mb-5 flex items-center gap-3",
          centered && "justify-center"
        )}
      >
        {index && (
          <>
            <span className="text-white/25 font-display">{index}</span>
            <span
              aria-hidden="true"
              className="inline-block h-px w-8 bg-primary/60"
            />
          </>
        )}
        <span>{eyebrow}</span>
        {index && centered && (
          <span
            aria-hidden="true"
            className="inline-block h-px w-8 bg-primary/60"
          />
        )}
      </p>
      <Tag className="text-4xl md:text-5xl font-bold text-white tracking-tight text-balance">
        {title}
      </Tag>
      {sub && (
        <p
          className={cn(
            "text-muted-foreground mt-4 text-base md:text-lg leading-relaxed text-balance",
            centered ? "max-w-2xl mx-auto" : "max-w-2xl"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
