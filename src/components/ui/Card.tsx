import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/**
 * Conteneur standard : surface blanche, bordure 1px, rayon 8.
 * Densité : padding 16 par défaut (`padded`), ou 0 pour un contenu à en-têtes.
 */
export function Card({
  as: Tag = "div",
  padded = true,
  className,
  children,
  ...props
}: {
  as?: "div" | "section" | "article";
  padded?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      data-slug={SLUGS.card}
      className={cn(
        "rounded-pop border border-border bg-surface",
        padded && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** En-tête de carte : barre fine sur `surface-3`, séparateur `border-soft`. */
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border-soft bg-surface-3 px-3 py-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
