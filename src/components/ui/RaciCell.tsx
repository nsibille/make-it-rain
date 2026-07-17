import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

export type RaciValue = "R" | "A" | "C" | "I" | "";

export const RACI_TONE: Record<Exclude<RaciValue, "">, string> = {
  R: "bg-raci-r-soft text-raci-r-text",
  A: "bg-raci-a-soft text-raci-a-text",
  C: "bg-raci-c-soft text-raci-c-text",
  I: "bg-raci-i-soft text-raci-i-text",
};

export const RACI_LABEL: Record<Exclude<RaciValue, "">, string> = {
  R: "Réalise",
  A: "Approuve",
  C: "Consulté",
  I: "Informé",
};

/** Cellule RACI : carré teinté (soft + texte), mono 10/600. Vide = tiret. */
export function RaciCell({
  value,
  className,
}: {
  value: RaciValue;
  className?: string;
}) {
  if (!value) {
    return <span className={cn("text-ink-5", className)}>—</span>;
  }
  return (
    <span
      data-slug={SLUGS.raciCell}
      className={cn(
        "inline-grid size-[18px] place-items-center rounded-chip font-mono text-micro font-semibold",
        RACI_TONE[value],
        className,
      )}
    >
      {value}
    </span>
  );
}
