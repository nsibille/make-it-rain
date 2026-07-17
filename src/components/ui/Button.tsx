import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Compact par principe (cf. référence : aucun bouton « gros »).
const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-node font-medium leading-none whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-55 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  // primary = texte blanc sur encre (#14161A) · hover #282B31
  primary: "border border-ink bg-ink text-surface hover:bg-ink-1",
  // secondary = blanc, bordure #D3D6DA
  secondary:
    "border border-border-strong bg-surface text-ink hover:bg-surface-2",
  ghost: "border border-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
  // danger = rouge soft (fill + line + text)
  danger:
    "border border-status-blocked-line bg-status-blocked-soft text-status-blocked-text hover:brightness-[0.98]",
};

const SIZES: Record<Size, string> = {
  md: "text-body px-[13px] py-[6px]",
  sm: "text-caption px-[9px] py-[4px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, type, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        data-slug={SLUGS.button}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        {...props}
      />
    );
  },
);

/** Bouton icône carré (26px) — « + », « ⋯ », zoom… (cf. référence). */
export const IconButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function IconButton({ className, type, ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      data-slug={SLUGS.button}
      className={cn(
        "grid size-[26px] shrink-0 place-items-center rounded-node border border-border bg-surface text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-55 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
});
