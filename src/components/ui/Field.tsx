import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

/** Label technique : mono, MAJUSCULES, tracking large (cf. référence). */
export function FieldLabel({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <span
      className={cn("label-mono text-nano mb-1.5 block", className)}
      {...(props as React.HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
}

// Champ compact : bordure #D3D6DA, rayon 6, padding 7×10, corps 13.
export const INPUT_BASE =
  "w-full rounded-node border border-border-strong bg-surface px-2.5 py-[7px] text-body text-ink outline-none transition-colors placeholder:text-ink-5 focus:border-ink-4 focus:bg-surface-2 disabled:opacity-55";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type ?? "text"}
        data-slug={SLUGS.field}
        className={cn(INPUT_BASE, type === "date" && "font-mono text-caption", className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 3, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      data-slug={SLUGS.field}
      className={cn(INPUT_BASE, "resize-y", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        data-slug={SLUGS.field}
        className={cn(INPUT_BASE, "cursor-pointer appearance-none pr-8", className)}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-micro text-ink-3"
      >
        ▾
      </span>
    </div>
  );
});
