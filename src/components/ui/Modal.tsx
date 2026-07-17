"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        data-slug={SLUGS.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-pop border border-border bg-surface shadow-2",
          className,
        )}
      >
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <h2 className="text-section text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-node p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
