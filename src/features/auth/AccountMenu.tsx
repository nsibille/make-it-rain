"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { SLUGS } from "@/lib/slugs";
import { cn } from "@/lib/cn";

/**
 * Menu compte (pied de sidebar) : identité + déconnexion.
 * Popover vers le haut, fermeture au clic extérieur / Échap.
 */
export function AccountMenu({ email }: { email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = email ?? "Compte";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={ref} data-slug={SLUGS.accountMenu} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-node border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-surface-2",
          open && "border-border bg-surface-2",
        )}
      >
        <Avatar name={label} size={24} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-caption text-ink">{label}</span>
          <span className="block truncate font-mono text-nano text-ink-4">
            Compte
          </span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-ink-4" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-20 mb-1 w-full overflow-hidden rounded-pop border border-border bg-surface shadow-2"
        >
          {email && (
            <div className="border-b border-border-soft px-3 py-2">
              <p className="label-mono text-nano">Connecté</p>
              <p className="mt-0.5 truncate font-mono text-caption text-ink">
                {email}
              </p>
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={loading}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-caption text-ink transition-colors hover:bg-surface-2 disabled:opacity-55"
          >
            <LogOut size={14} className="text-ink-3" aria-hidden />
            {loading ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      )}
    </div>
  );
}
