# CLAUDE.md — Cadrage Studio

Contexte permanent pour Claude Code. À lire **en entier** avant toute action, à chaque session.

## 1. Le produit en une phrase

Outil de cadrage projet pour PMO : on entre un brief structuré (le **6-Pack**), l'app produit des **arborescences claires** (PBS, WBS, OBS) et un **schéma de gouvernance**, partageables avec des collègues en lecture ou en annotation.

Références méthodo : PMP / PMBOK (PBS = découpage produit, WBS = découpage du travail, OBS = découpage organisationnel, RACI + instances = gouvernance).

## 2. Stack

- **Framework** : **Next.js (App Router, ≥14)** + TypeScript + Tailwind CSS. Routing par fichiers dans `app/`.
- **Supabase côté Next** : `@supabase/ssr` + `@supabase/supabase-js`. Auth par **cookies/SSR** — client navigateur et client serveur distincts (voir §7bis), `middleware.ts` à la racine pour rafraîchir la session.
- **Rendu** : Server Components par défaut pour le read (listes, chargement projet) ; **Client Components** (`'use client'`) pour l'interactif — arbres, annotations, formulaires 6-Pack. Mutations via **Server Actions** ou hooks client selon le cas.
- **Data client** : TanStack Query (cache) + Zustand (état UI léger) dans les Client Components. Realtime Supabase pour les annotations.
- **Layout d'arbre** : `d3-hierarchy` **uniquement** (pas tout d3), dans un Client Component — `hierarchy()` + `tree()`, rendu SVG maison (voir DESIGN_SYSTEM.md).
- **Backend** : Supabase (Postgres + Auth + RLS + Realtime).
- **Déploiement** : Vercel (intégration Next native). Variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Icônes** : `lucide-react`. **Polices** : `Helvetica Neue` (sans, system stack) + `JetBrains Mono` (mono, via `next/font/google`).
- **Design system** : **source de vérité = `src/styles/tokens.css`** (issu de Claude Design), mappé en thème Tailwind dans `src/app/globals.css`. Réf. complète : `design/design-system-reference.html`. `DESIGN_SYSTEM.md` ne porte que la couche métier (arbres, gouvernance). Ne jamais coder une couleur/typo en dur : lire les tokens.

`.env.example` :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
> La **service role key** n'est jamais exposée au client. Si un besoin serveur l'exige (rare ici, la RLS suffit), elle reste en variable serveur non préfixée `NEXT_PUBLIC_`.

## 3. Arborescence des dossiers

```
middleware.ts          # rafraîchit la session Supabase (racine)
src/
  app/
    (auth)/login/page.tsx
    (app)/
      layout.tsx                     # shell + sidebar (RSC)
      page.tsx                       # accueil / dossiers
      p/[projectId]/
        layout.tsx                   # charge le projet + onglets de vue
        six-pack/page.tsx
        pbs/page.tsx  wbs/page.tsx  obs/page.tsx
        governance/page.tsx
      actions.ts                     # Server Actions (create project, invite, publish…)
    layout.tsx                       # <html>, next/font, providers
  features/
    filesystem/  six-pack/  breakdown/  governance/  collaboration/  projects/
  lib/
    supabase/
      client.ts       # createBrowserClient  (Client Components)
      server.ts       # createServerClient    (RSC / Server Actions)
      middleware.ts   # helper de rafraîchissement de session
    slugs.ts          # registre des slugs (voir §5)
    queries/          # hooks TanStack Query (Client Components)
  data/examples.ts    # les 2 projets pizza (seed)
  components/ui/        # primitives (Button, Chip, Modal, …)
supabase/
  migrations/0001_init.sql
```

Une vue = une sous-route (`/p/[id]/wbs`) pour des **URL partageables/deep-linkables** — cohérent avec publication/partage. Un `feature/` = un domaine ; pas de logique métier dans `components/ui/` (primitives pures). Les composants interactifs de `features/` sont des Client Components ; les pages qui les enveloppent chargent les données en RSC et les passent en props.

## 4. Modèle de données

Défini dans `supabase/migrations/0001_init.sql`. Résumé :

- `organizations`, `profiles` — identité, scope org.
- `folders` — filesystem imbriquable (`parent_id`), `is_system` pour « Exemples ».
- `projects` — `status` = draft | published | shared, `owner_id`.
- `project_members` — partage : `role` = pmo | annotator | observer. **Le propriétaire est pmo implicite**, pas de ligne pour lui.
- `sixpacks` (contexte, contraintes) + `sixpack_items` — kinds : `objective`, `deliverable`, `stakeholder` (meta.role), `milestone` (meta.date), **`scope_in` / `scope_out`** (périmètre IN / OUT).
- `breakdown_nodes` — table auto-référente unique pour PBS/WBS/OBS (`structure`, `parent_id`, `position`, `meta`). **Les codes sont calculés côté client depuis la position, jamais stockés** ; format **`1.0` → `1.0.1` → `1.0.1.1`** (voir DESIGN_SYSTEM). `meta` porte les responsabilités OBS (`{acteur, responsabilites}`).
- `governance` — `instances` et `raci` en jsonb. Chaque instance/réunion : `name, animateur, scribe, acteurs[], frequence, duree, objectif, docs_in[], docs_out[]`.
- `annotations` — liées à un `node_id`, temps réel.

Un trigger `bootstrap_project` crée automatiquement le 6-Pack, la gouvernance et les 3 racines à la création d'un projet.

## 5. Conventions (discipline des slugs)

Chaque composant réutilisable a un **slug kebab-case stable**, source unique de vérité pour : nom de fichier, `data-slug` sur la racine du composant, clé d'événement analytics, et id de test.

- Déclaré dans `src/lib/slugs.ts` : `export const SLUGS = { breakdownTree: 'breakdown-tree', sixPack: 'six-pack', annotationDrawer: 'annotation-drawer', … } as const`.
- Fichier : `BreakdownTree.tsx` exporte un composant dont la racine porte `data-slug={SLUGS.breakdownTree}`.
- Ne jamais dupliquer un slug. Ne jamais renommer un slug sans mettre à jour le registre.

Autres règles : composants en PascalCase, hooks en `useXxx`, identifiants de code en anglais, textes d'interface en **français**. Pas de `any` non justifié. Un composant = un fichier.

## 6. Rôles & permissions (à respecter à la lettre)

| Action                         | PMO (owner) | Annotateur | Observateur |
|--------------------------------|:-----------:|:----------:|:-----------:|
| Voir le projet                 | ✅ | ✅ | ✅ |
| Éditer 6-Pack / arbres / gouv. | ✅ | ❌ | ❌ |
| Annoter un nœud                | ✅ | ✅ | ❌ |
| Inviter / publier / partager   | ✅ | ❌ | ❌ |

Ces règles sont **appliquées par la RLS Postgres** (pas seulement l'UI). L'UI reflète les droits (champs désactivés, boutons masqués) mais la sécurité vit dans la base. Ne jamais contourner la RLS avec la service key côté client.

## 7. Setup base de données — MCP d'abord

Initialiser Supabase **via le MCP Supabase**, pas le dashboard à la main :
1. `list_organizations` / `list_projects` pour repérer le bon compte cible.
2. Si aucun projet : `create_project` (après `confirm_cost`).
3. `apply_migration` avec `supabase/migrations/0001_init.sql`.
4. `get_project_url` + `get_publishable_keys` → remplir `.env`.
5. `get_advisors` (sécurité) après migration : zéro table sans RLS attendue.

> Note d'auth : au premier appel MCP, une connexion **OAuth ponctuelle** peut être demandée si l'organisation active diffère du compte cible. La faire une fois, puis reprendre. Confirmer avec l'utilisateur **quelle org / quel compte** héberge ce projet avant `create_project`.

## 7bis. Câblage Supabase dans Next.js (App Router)

- `lib/supabase/client.ts` → `createBrowserClient` (`@supabase/ssr`), utilisé dans les Client Components.
- `lib/supabase/server.ts` → `createServerClient` avec accès aux `cookies()` de `next/headers`, utilisé dans les RSC et Server Actions. **Recréer le client à chaque requête** (ne pas mettre en cache un client global côté serveur).
- `middleware.ts` (racine) → rafraîchit la session à chaque navigation via le helper `lib/supabase/middleware.ts`. `matcher` excluant assets statiques.
- La RLS s'applique de la même façon en RSC, en Server Action et côté client : c'est la session (cookie) qui porte `auth.uid()`. Ne jamais lire des données protégées avec la service key pour « simplifier ».
- Realtime (annotations) : abonnement **client uniquement**, dans un Client Component monté sur la vue d'arbre.

## 8. Garde-fous

- **Ne pas** stocker les codes hiérarchiques en base (calcul client).
- **Ne pas** mettre de logique de permissions uniquement dans l'UI.
- **Ne pas** importer tout `d3` — seulement `d3-hierarchy`.
- **Ne pas** utiliser `localStorage` pour des données projet (tout passe par Supabase).
- **Ne pas** exposer la service role key au client, ni la préfixer `NEXT_PUBLIC_`.
- **Ne pas** rendre `'use client'` par défaut : Server Component sauf besoin d'interactivité/hooks/Realtime.
- **Ne pas** appeler `d3-hierarchy` dans un Server Component (client only).
- Respecter DESIGN_SYSTEM.md à la lettre pour couleurs/typo/arbre.
- Livrable responsive, focus clavier visible, `prefers-reduced-motion` respecté.

## 9. Ordre de construction

Suivre `CLAUDE_CODE_PROMPT.md` (jalons M0→M8) et cocher les critères d'acceptation avant de passer au suivant.
