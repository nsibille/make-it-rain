"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";
import { useIsClient } from "@/lib/useIsClient";

/**
 * Toaster — notifications discrètes qui guident l'utilisateur (DESIGN_SYSTEM
 * §Toaster). Trois intentions :
 *  - `info`    : aide contextuelle, indication légère.
 *  - `success` : réassurance (« Projet publié », « Modifications enregistrées »).
 *  - `error`   : erreur précise, sans excuse.
 *
 * Empilées en bas à droite, fondu à l'entrée et à la sortie, auto-effacées
 * après un délai (sauf `duration: null`). Fermeture d'une notification ou de
 * toutes. Le mouvement suit les tokens et se neutralise sous
 * `prefers-reduced-motion` (règle globale de globals.css).
 */

export type ToastVariant = "info" | "success" | "error";

export interface ToastOptions {
  variant?: ToastVariant;
  /** Millisecondes avant auto-effacement ; `null` = persistant (fermeture manuelle). */
  duration?: number | null;
}

interface ToastRecord {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number | null;
  /** Vrai pendant l'animation de sortie, avant le retrait du DOM. */
  leaving: boolean;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: Omit<ToastOptions, "variant">) => string;
  error: (message: string, options?: Omit<ToastOptions, "variant">) => string;
  info: (message: string, options?: Omit<ToastOptions, "variant">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Durées par défaut selon l'intention (erreur reste plus longtemps lisible). */
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  info: 4000,
  success: 3000,
  error: 6000,
};

/** Au-delà, on retire la plus ancienne pour ne jamais encombrer l'écran. */
const MAX_VISIBLE = 4;

/** Durée de l'animation de sortie (aligné sur --duration-instant). */
const LEAVE_MS = 90;

const VARIANT_STYLES: Record<
  ToastVariant,
  { rail: string; icon: string; Icon: typeof Info; role: "status" | "alert" }
> = {
  info: {
    rail: "border-l-border-strong",
    icon: "text-ink-3",
    Icon: Info,
    role: "status",
  },
  success: {
    rail: "border-l-status-done-line",
    icon: "text-status-done-text",
    Icon: CheckCircle2,
    role: "status",
  },
  error: {
    rail: "border-l-status-blocked-line",
    icon: "text-status-blocked-text",
    Icon: AlertTriangle,
    role: "alert",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  // Compteur d'id stable, sans Date.now()/Math.random() (évite le mismatch SSR).
  const seq = useRef(0);
  // Timers d'auto-effacement, nettoyés au démontage.
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  // Retrait effectif : marque `leaving` (fondu de sortie) puis supprime.
  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      const t = setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
        timers.current.delete(id);
      }, LEAVE_MS);
      timers.current.set(id, t);
    },
    [clearTimer],
  );

  const dismissAll = useCallback(() => {
    setToasts((prev) => {
      prev.forEach((t) => clearTimer(t.id));
      const t = setTimeout(() => setToasts([]), LEAVE_MS);
      timers.current.set("__all__", t);
      return prev.map((x) => ({ ...x, leaving: true }));
    });
  }, [clearTimer]);

  const toast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const variant = options.variant ?? "info";
      const duration =
        options.duration === undefined
          ? DEFAULT_DURATION[variant]
          : options.duration;
      const id = `toast-${(seq.current += 1)}`;

      setToasts((prev) => {
        const next = [...prev, { id, message, variant, duration, leaving: false }];
        // Cap : au-delà de MAX_VISIBLE, on programme le retrait des plus anciennes.
        const overflow = next.length - MAX_VISIBLE;
        if (overflow > 0) {
          next.slice(0, overflow).forEach((t) => {
            // différé pour ne pas muter l'état pendant le rendu
            queueMicrotask(() => dismiss(t.id));
          });
        }
        return next;
      });

      if (duration !== null) {
        const t = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, t);
      }
      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, "variant">) =>
      toast(message, { ...options, variant: "success" }),
    [toast],
  );
  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "variant">) =>
      toast(message, { ...options, variant: "error" }),
    [toast],
  );
  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, "variant">) =>
      toast(message, { ...options, variant: "info" }),
    [toast],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{ toast, success, error, info, dismiss, dismissAll }}
    >
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} onDismissAll={dismissAll} />
    </ToastContext.Provider>
  );
}

/** Hook d'accès au toaster. À utiliser dans un Client Component sous le provider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast doit être utilisé sous <ToastProvider>.");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
  onDismissAll,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}) {
  const isClient = useIsClient();
  if (!isClient || toasts.length === 0) return null;

  const activeCount = toasts.filter((t) => !t.leaving).length;

  return createPortal(
    <div
      data-slug={SLUGS.toaster}
      // Région live polie : les lecteurs d'écran annoncent sans interrompre.
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
    >
      {activeCount > 1 && (
        <button
          type="button"
          onClick={onDismissAll}
          className="pointer-events-auto label-mono text-nano rounded-node px-2 py-1 text-ink-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Tout fermer
        </button>
      )}
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const { rail, icon, Icon, role } = VARIANT_STYLES[toast.variant];

  return (
    <div
      data-slug={SLUGS.toast}
      data-variant={toast.variant}
      role={role}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-pop border border-l-[3px] border-border bg-surface px-3.5 py-2.5 shadow-2",
        rail,
        toast.leaving ? "animate-toast-out" : "animate-toast-in",
      )}
    >
      <Icon size={16} className={cn("mt-px shrink-0", icon)} aria-hidden />
      <p className="min-w-0 flex-1 text-body text-ink-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="-mr-1 -mt-0.5 shrink-0 rounded-node p-1 text-ink-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
