import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

// Palette catégorielle stable : dérivée du nom (hachage simple).
const TEAM_BG = [
  "bg-ink",
  "bg-team-1",
  "bg-team-2",
  "bg-team-3",
  "bg-team-4",
  "bg-team-5",
  "bg-team-6",
] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toneFor(name: string, tone?: number): string {
  if (tone != null) return TEAM_BG[tone % TEAM_BG.length];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TEAM_BG[1 + (h % (TEAM_BG.length - 1))];
}

/** Pastille d'identité : initiales sur fond catégoriel. */
export function Avatar({
  name,
  size = 22,
  tone,
  ring = false,
  className,
}: {
  name: string;
  size?: number;
  tone?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      data-slug={SLUGS.avatar}
      title={name}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-medium text-surface",
        toneFor(name, tone),
        ring && "ring-2 ring-surface",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.4)),
      }}
    >
      {initials(name)}
    </span>
  );
}
