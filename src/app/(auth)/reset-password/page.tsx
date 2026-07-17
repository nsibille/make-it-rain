"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";
import { PasswordStrength } from "@/features/auth/PasswordStrength";

const MIN_PASSWORD = 8;

type Ready = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<Ready>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Le lien de récupération a établi une session via /auth/callback.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setReady(data.user ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Mot de passe trop court (${MIN_PASSWORD} caractères minimum).`);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setReady("done");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-5 text-title text-ink">Nouveau mot de passe</h1>

        {ready === "checking" && (
          <p className="mt-2 text-body text-ink-3">Vérification du lien…</p>
        )}

        {ready === "invalid" && (
          <>
            <p className="mt-1.5 text-body text-ink-2">
              Ce lien de réinitialisation est invalide ou expiré.
            </p>
            <Button className="mt-5" onClick={() => router.replace("/login")}>
              Retour à la connexion
            </Button>
          </>
        )}

        {ready === "done" && (
          <>
            <p className="mt-1.5 text-body text-ink-2">
              Mot de passe mis à jour. Vous êtes connecté.
            </p>
            <Button className="mt-5" onClick={() => router.replace("/")}>
              Accéder à mes projets
            </Button>
          </>
        )}

        {ready === "ready" && (
          <>
            <p className="mt-1.5 text-body text-ink-2">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <FieldLabel>Nouveau mot de passe</FieldLabel>
                <Input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`${MIN_PASSWORD} caractères min.`}
                />
                <PasswordStrength value={password} min={MIN_PASSWORD} />
              </label>
              <label className="block">
                <FieldLabel>Confirmer</FieldLabel>
                <Input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {error && (
                <p className="text-caption text-status-blocked-text">{error}</p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "…" : "Mettre à jour"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
