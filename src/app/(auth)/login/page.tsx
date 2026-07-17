"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-5 text-title text-ink">Connexion</h1>
        <p className="mt-1.5 text-body text-ink-2">
          Entrez votre email : on vous envoie un lien magique de connexion.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-pop border border-border bg-surface-2 p-4">
            <p className="text-body font-semibold text-ink">Lien envoyé.</p>
            <p className="mt-1 text-body text-ink-2">
              Ouvrez l’email envoyé à{" "}
              <span className="font-mono text-caption text-ink">{email}</span>{" "}
              et cliquez sur le lien pour vous connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <FieldLabel>Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
              />
            </div>

            {status === "error" && (
              <p className="text-caption text-status-blocked-text">{message}</p>
            )}

            <Button
              type="submit"
              disabled={status === "sending"}
              className="w-full"
            >
              {status === "sending" ? "Envoi…" : "Recevoir le lien"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
