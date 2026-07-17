import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/** Barre de progression fine (5px) : piste `border-soft` + remplissage teinté. */
export function ProgressBar({
  label,
  value,
  fillClassName = "bg-status-progress",
  className,
}: {
  label?: string;
  value: number;
  fillClassName?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div data-slug={SLUGS.progressBar} className={className}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-caption">
          <span className="text-ink-2">{label}</span>
          <span className="font-mono text-ink-3">{pct}%</span>
        </div>
      )}
      <div className="h-[5px] overflow-hidden rounded-full bg-border-soft">
        <div
          className={cn("h-full rounded-full", fillClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
