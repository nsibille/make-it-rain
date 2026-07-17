import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback PKCE : Supabase redirige ici avec un `code` après
 * confirmation d'email (inscription) ou lien de réinitialisation de
 * mot de passe. On l'échange contre une session (cookies posés par le
 * client serveur) puis on renvoie vers `next`. Le profil est créé par le
 * trigger handle_new_user à la création du compte.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Anti open-redirect : on n'accepte qu'un chemin interne.
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
