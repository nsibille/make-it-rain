/**
 * Codes hiérarchiques PBS/WBS — calculés depuis la position, JAMAIS stockés.
 * N1 = code projet (ex. PZ-01) ; N2 = 1.0, 2.0… ; puis parent + rang :
 * 1.0 → 1.0.1 → 1.0.1.1. L'OBS n'est pas numéroté (acteur + responsabilités).
 */

/** Code court N1 dérivé du nom de projet : 2 initiales majuscules + -01. */
export function projectCode(name: string): string {
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!)
    .join("")
    .toUpperCase();
  const code = (initials || "PR").slice(0, 2);
  return `${code}-01`;
}

/** Code d'un nœud selon sa profondeur et son rang dans la fratrie. */
export function nodeCode(
  depth: number,
  siblingIndex: number,
  parentCode: string,
  rootCode: string,
): string {
  if (depth === 0) return rootCode;
  if (depth === 1) return `${siblingIndex + 1}.0`;
  return `${parentCode}.${siblingIndex + 1}`;
}
