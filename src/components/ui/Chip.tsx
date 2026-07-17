import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

export type ChipTone =
  | "neutral"
  | "team-1"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "team-6"
  | "pbs"
  | "wbs"
  | "obs";

// fond soft + bordure line + point mark, par teinte.
const TONES: Record<ChipTone, { box: string; dot: string }> = {
  neutral: { box: "bg-surface-2 border-border text-ink-2", dot: "bg-ink-4" },
  "team-1": { box: "bg-team-1-soft border-team-1-line text-ink", dot: "bg-team-1" },
  "team-2": { box: "bg-team-2-soft border-team-2-line text-ink", dot: "bg-team-2" },
  "team-3": { box: "bg-team-3-soft border-team-3-line text-ink", dot: "bg-team-3" },
  "team-4": { box: "bg-team-4-soft border-team-4-line text-ink", dot: "bg-team-4" },
  "team-5": { box: "bg-team-5-soft border-team-5-line text-ink", dot: "bg-team-5" },
  "team-6": { box: "bg-team-6-soft border-team-6-line text-ink", dot: "bg-team-6" },
  pbs: { box: "bg-pbs-soft border-pbs-line text-ink", dot: "bg-pbs" },
  wbs: { box: "bg-wbs-soft border-wbs-line text-ink", dot: "bg-wbs" },
  obs: { box: "bg-obs-soft border-obs-line text-ink", dot: "bg-obs" },
};

/** Pastille catégorielle (équipe, périmètre, partie prenante…). */
export function Chip({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: ChipTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      data-slug={SLUGS.chip}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-caption",
        t.box,
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />}
      {children}
    </span>
  );
}
