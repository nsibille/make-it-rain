import { createClient } from "@/lib/supabase/server";
import { SessionBadge } from "@/features/auth/SessionBadge";
import { SignOutButton } from "@/features/auth/SignOutButton";

/**
 * Home protégée (RSC). Lit le profil via le client serveur : la lecture
 * passe par la RLS (profiles read = soi + même org). Le filesystem /
 * sidebar arrivent au M2 ; ici on prouve juste la chaîne Auth + SSR + RLS.
 */
export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono text-nano">Cadrage Studio · M1</p>
          <h1 className="mt-2 text-title text-ink">Session active</h1>
        </div>
        <SignOutButton />
      </div>

      <p className="mt-3 max-w-xl text-body text-ink-2">
        Auth SSR opérationnelle. La lecture ci-dessous passe par le client
        serveur (RSC) puis par le client navigateur — les deux sous RLS.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Chemin serveur (RSC) */}
        <div className="rounded-node border border-border bg-surface-2 p-4">
          <p className="label-mono text-nano">Profil (serveur · RSC)</p>
          <dl className="mt-2 space-y-1 text-body">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">Email</dt>
              <dd className="font-mono text-caption text-ink">
                {profile?.email ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">User ID</dt>
              <dd className="truncate font-mono text-caption text-ink">
                {user!.id}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">Org</dt>
              <dd className="font-mono text-caption text-ink">
                {profile?.org_id ?? "aucune"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Chemin client (TanStack Query) */}
        <SessionBadge />
      </div>
    </main>
  );
}
