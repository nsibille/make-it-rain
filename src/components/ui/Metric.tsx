import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/** Métrique compacte : label mono + grand chiffre (20px/600). */
export function Metric({
  label,
  value,
  unit,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  accent?: "danger" | "done" | "progress";
  className?: string;
}) {
  const accentClass =
    accent === "danger"
      ? "text-status-blocked"
      : accent === "done"
        ? "text-status-done"
        : accent === "progress"
          ? "text-status-progress"
          : "text-ink";
  return (
    <div
      data-slug={SLUGS.metric}
      className={cn(
        "min-w-[78px] rounded-node border border-border bg-surface px-3 py-2",
        className,
      )}
    >
      <div className="label-mono text-nano">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-[20px] font-semibold leading-none tracking-[-0.02em]",
          accentClass,
        )}
      >
        {value}
        {unit && <span className="text-caption text-ink-3">{unit}</span>}
      </div>
    </div>
  );
}
