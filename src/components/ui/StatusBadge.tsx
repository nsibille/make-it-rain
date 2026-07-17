import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/**
 * Pastille d'état générique : point coloré + label mono.
 * `dotClassName` porte la teinte (ex. "bg-status-done") depuis les tokens.
 */
export function StatusBadge({
  label,
  dotClassName,
  className,
}: {
  label: string;
  dotClassName: string;
  className?: string;
}) {
  return (
    <span
      data-slug={SLUGS.statusBadge}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip border border-border bg-surface px-2 py-0.5",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />
      <span className="label-mono text-nano !text-ink-2">{label}</span>
    </span>
  );
}
