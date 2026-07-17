import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-node font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-surface hover:bg-ink-1",
  secondary:
    "bg-surface text-ink border border-border-strong hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "text-danger border border-border-strong hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "text-caption px-2.5 py-1.5",
  md: "text-body px-3.5 py-2",
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
