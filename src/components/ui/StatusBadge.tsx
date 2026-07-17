import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

export type StatusTone =
  | "draft"
  | "progress"
  | "blocked"
  | "waiting"
  | "done";

// fill soft + bordure line + texte teinté + point mark (cf. référence).
const TONES: Record<StatusTone, { box: string; dot: string }> = {
  draft: {
    box: "bg-surface-2 border-border text-ink-2",
    dot: "bg-status-draft",
  },
  progress: {
    box: "bg-status-progress-soft border-status-progress-line text-status-progress-text",
    dot: "bg-status-progress",
  },
  blocked: {
    box: "bg-status-blocked-soft border-status-blocked-line text-status-blocked-text",
    dot: "bg-status-blocked",
  },
  waiting: {
    box: "bg-status-waiting-soft border-status-waiting-line text-status-waiting-text",
    dot: "bg-status-waiting",
  },
  done: {
    box: "bg-status-done-soft border-status-done-line text-status-done-text",
    dot: "bg-status-done",
  },
};

/** Badge d'état : point coloré + label, pastille teintée par état. */
export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      data-slug={SLUGS.statusBadge}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-caption",
        t.box,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />
      {label}
    </span>
  );
}
