import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/**
 * Indicateur d'activité — anneau en rotation (token `--duration`/`--ease`).
 * Utilisé dans les boutons occupés et les labels de chargement. `currentColor`
 * pour hériter de la couleur du contexte (texte du bouton, ink-3…).
 */
export function Spinner({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      data-slug={SLUGS.spinner}
      role="status"
      aria-label="Chargement"
      className={cn(
        "animate-spin-token inline-block shrink-0 rounded-full border-2 border-current border-r-transparent align-[-0.125em]",
        className,
      )}
      style={{ width: size, height: size, opacity: 0.7 }}
    />
  );
}
