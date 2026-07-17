"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup" | "forgot";

const MIN_PASSWORD = 8;

/** Traduit les messages d'erreur Supabase en français, sans fuite d'info. */
function frError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed"))
    return "Confirmez d’abord votre email : ouvrez le lien reçu à l’inscription.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cet email.";
  if (m.includes("password") && m.includes("at least"))
    return `Mot de passe trop court (${MIN_PASSWORD} caractères minimum).`;
  if (m.includes("rate limit") || m.includes("too many"))
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Adresse email invalide.";
  return message;
}

export function AuthForm({
  next = "/",
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "auth"
      ? "Lien invalide ou expiré. Reconnectez-vous."
      : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const supabase = createClient();
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    setPending(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
        });
        if (error) return setError(frError(error.message));
        setNotice(
          "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.",
        );
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return setError(frError(error.message));
        router.replace(next);
        router.refresh();
        return;
      }

      // signup
      if (password.length < MIN_PASSWORD) {
        return setError(
          `Choisissez un mot de passe d’au moins ${MIN_PASSWORD} caractères.`,
        );
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: fullName.trim() ? { full_name: fullName.trim() } : undefined,
        },
      });
      if (error) return setError(frError(error.message));

      // Email déjà utilisé : Supabase renvoie un user sans identités (anti-énumération).
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setNotice(
          "Un compte existe peut-être déjà pour cet email. Connectez-vous ou réinitialisez votre mot de passe.",
        );
        return;
      }
      // Confirmation d’email désactivée → session immédiate.
      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      // Confirmation requise.
      setNotice(
        `Compte créé. Ouvrez l’email envoyé à ${email} et cliquez sur le lien pour l’activer.`,
      );
    } finally {
      setPending(false);
    }
  }

  const title =
    mode === "signin"
      ? "Connexion"
      : mode === "signup"
        ? "Créer un compte"
        : "Mot de passe oublié";

  const subtitle =
    mode === "signin"
      ? "Accédez à vos projets de cadrage."
      : mode === "signup"
        ? "Quelques secondes pour démarrer votre premier cadrage."
        : "On vous envoie un lien pour définir un nouveau mot de passe.";

  return (
    <div className="w-full max-w-sm">
      <Wordmark />
      <h1 className="mt-5 text-title text-ink">{title}</h1>
      <p className="mt-1.5 text-body text-ink-2">{subtitle}</p>

      {mode !== "forgot" && (
        <div className="mt-5 inline-flex rounded-node border border-border bg-surface-2 p-0.5">
          <ModeTab active={mode === "signin"} onClick={() => switchMode("signin")}>
            Se connecter
          </ModeTab>
          <ModeTab active={mode === "signup"} onClick={() => switchMode("signup")}>
            Créer un compte
          </ModeTab>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === "signup" && (
          <label className="block">
            <FieldLabel>Nom complet (optionnel)</FieldLabel>
            <Input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sarah Lombardi"
            />
          </label>
        )}

        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.fr"
          />
        </label>

        {mode !== "forgot" && (
          <label className="block">
            <span className="flex items-baseline justify-between">
              <FieldLabel className="mb-0">Mot de passe</FieldLabel>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-caption text-ink-3 hover:text-ink"
                >
                  Oublié ?
                </button>
              )}
            </span>
            <div className="relative mt-1.5">
              <Input
                type={showPw ? "text" : "password"}
                required
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? `${MIN_PASSWORD} caractères min.` : "••••••••"}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Masquer" : "Afficher"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-chip p-1 text-ink-3 hover:text-ink"
              >
                {showPw ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
              </button>
            </div>
          </label>
        )}

        {error && (
          <p className="text-caption text-status-blocked-text">{error}</p>
        )}
        {notice && (
          <div className="rounded-node border border-status-progress-line bg-status-progress-soft px-3 py-2">
            <p className="text-caption text-status-progress-text">{notice}</p>
          </div>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? "…"
            : mode === "signin"
              ? "Se connecter"
              : mode === "signup"
                ? "Créer mon compte"
                : "Envoyer le lien"}
        </Button>
      </form>

      {mode === "forgot" && (
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="mt-4 text-caption text-ink-3 hover:text-ink"
        >
          ← Retour à la connexion
        </button>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-chip px-3 py-1 text-caption font-medium transition-colors",
        active
          ? "bg-surface text-ink shadow-1"
          : "text-ink-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
