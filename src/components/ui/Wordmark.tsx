import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/**
 * Logo Stuudio = pictogramme « pastilles » (grille 2×3 de carrés encre) +
 * mot-symbole « Stuudio ». Reproduit la référence (design-system-reference.html).
 */
export function Logomark({
  cell = 6,
  gap = 2,
  radius = 1.5,
  className,
}: {
  cell?: number;
  gap?: number;
  radius?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-grid", className)}
      style={{
        gridTemplateColumns: `repeat(2, ${cell}px)`,
        gridTemplateRows: `repeat(3, ${cell}px)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="bg-ink"
          style={{ borderRadius: `${radius}px` }}
        />
      ))}
    </span>
  );
}

/**
 * Mot-symbole complet. `variant="app"` = pictogramme + « Stuudio » 14px/600
 * (sidebar, login). `variant="bar"` = version mono compacte (barre de projet).
 */
export function Wordmark({
  variant = "app",
  className,
}: {
  variant?: "app" | "bar";
  className?: string;
}) {
  if (variant === "bar") {
    return (
      <span
        data-slug={SLUGS.wordmark}
        className={cn("inline-flex items-center gap-2", className)}
      >
        <Logomark cell={5} gap={1.5} radius={1} />
        <span className="font-mono text-micro text-ink-3">Stuudio</span>
      </span>
    );
  }
  return (
    <span
      data-slug={SLUGS.wordmark}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <Logomark />
      <span className="text-[14px] font-semibold leading-none tracking-[-0.01em] text-ink">
        Stuudio
      </span>
    </span>
  );
}
