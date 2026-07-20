import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { Instance } from "@/features/governance/data";
import { EXAMPLE_PROJECTS, type GovInstance } from "@/data/examples";

/**
 * Le schéma d'exemple porte `objectifs: string[]` (plusieurs objectifs par
 * réunion) alors que le modèle gouvernance de l'app n'a qu'un `objectif`
 * unique (une zone de texte). On fait le pont en joignant les objectifs, sans
 * migration ni refonte de la gouvernance.
 */
function toInstance(gi: GovInstance): Instance {
  const { objectifs, ...rest } = gi;
  return { ...rest, objectif: objectifs.join("\n") };
}

/**
 * Sème les deux exemples pizza dans un dossier système « Exemples » à la
 * première connexion.
 *
 * Tout le travail est délégué à la fonction Postgres `seed_examples`
 * (SECURITY DEFINER, migration 0003) : elle s'exécute en une transaction,
 * avec un verrou consultatif par utilisateur. C'est ce qui garantit :
 *   - idempotence (ne refait rien si les exemples existent déjà) ;
 *   - absence de course (plus de dossiers « Exemples » en double) ;
 *   - atomicité (un échec n'laisse pas un dossier vide irrécupérable).
 * Le contenu (src/data/examples.ts) reste la source de vérité, envoyé en
 * JSONB ; la gouvernance est mappée (objectifs[] → objectif unique) avant l'envoi.
 */
export async function seedExamplesIfEmpty(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const payload = EXAMPLE_PROJECTS.map((ex) => ({
    ...ex,
    governance: {
      ...ex.governance,
      instances: ex.governance.instances.map(toInstance),
    },
  }));

  await supabase.rpc("seed_examples", { payload: payload as unknown as Json });
}
