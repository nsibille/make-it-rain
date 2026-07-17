import { cn } from "@/lib/cn";

/**
 * Jauge de force du mot de passe : 3 segments + libellé.
 * Sous le minimum requis → « Trop court » (rouge). Sinon score sur la
 * longueur et la diversité des caractères → Faible / Moyen / Fort.
 */
export function passwordScore(
  pw: string,
  min: number,
): { level: 0 | 1 | 2 | 3; label: string; bar: string; text: string } {
  if (pw.length === 0)
    return { level: 0, label: "", bar: "", text: "text-ink-4" };
  if (pw.length < min)
    return {
      level: 1,
      label: `Trop court — ${min} caractères min.`,
      bar: "bg-status-blocked",
      text: "text-status-blocked-text",
    };

  let score = 0;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1)
    return {
      level: 1,
      label: "Faible",
      bar: "bg-status-waiting",
      text: "text-status-waiting-text",
    };
  if (score === 2)
    return {
      level: 2,
      label: "Moyen",
      bar: "bg-status-progress",
      text: "text-status-progress-text",
    };
  return {
    level: 3,
    label: "Fort",
    bar: "bg-status-done",
    text: "text-status-done-text",
  };
}

export function PasswordStrength({
  value,
  min,
  className,
}: {
  value: string;
  min: number;
  className?: string;
}) {
  if (value.length === 0) return null;
  const s = passwordScore(value, min);

  return (
    <div className={cn("mt-1.5", className)} aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3].map((seg) => (
          <span
            key={seg}
            className={cn(
              "h-[3px] flex-1 rounded-full",
              seg <= s.level ? s.bar : "bg-border-soft",
            )}
          />
        ))}
      </div>
      <p className={cn("mt-1 font-mono text-nano", s.text)}>{s.label}</p>
    </div>
  );
}
