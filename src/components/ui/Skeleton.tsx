import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/**
 * Squelette de chargement — bloc neutre à balayage clair (`.skeleton`,
 * défini dans globals.css, token `--shimmer-period`). Sert de brique aux
 * écrans de chargement (route `loading.tsx`) et au lazy loading.
 *
 * `variant` règle la forme : `block` (rayon nœud), `text` (ligne fine),
 * `circle` (avatar/pastille). Passez `w`/`h` (px) ou des classes Tailwind.
 */
export function Skeleton({
  variant = "block",
  w,
  h,
  className,
  style,
}: {
  variant?: "block" | "text" | "circle";
  w?: number | string;
  h?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      data-slug={SLUGS.skeleton}
      aria-hidden
      className={cn(
        "skeleton block",
        variant === "text" && "h-[0.7em] rounded-chip",
        variant === "circle" && "rounded-full",
        className,
      )}
      style={{ width: w, height: h, ...style }}
    />
  );
}

/** Bloc de plusieurs lignes de texte, la dernière raccourcie (paragraphe). */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </span>
  );
}
