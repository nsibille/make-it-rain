# CLAUDE_CODE_PROMPT.md — Prompt d'initialisation

Copie ce bloc dans Claude Code au démarrage du projet.

---

Tu vas construire **Cadrage Studio**, une app de cadrage projet pour PMO.

**Avant tout code**, lis dans l'ordre : `CLAUDE.md`, `DESIGN_SYSTEM.md`, `PROJECT_SPEC.md`. Ces trois fichiers font autorité — en cas de doute, ils l'emportent sur ton intuition. Ne me demande pas de reformuler ce qui y est déjà écrit.

Puis initialise la base **via le MCP Supabase** en suivant CLAUDE.md §7 : confirme avec moi l'org/compte cible, crée le projet si besoin, applique `supabase/migrations/0001_init.sql`, récupère l'URL + la clé publiable dans `.env`, et lance `get_advisors` pour vérifier que la RLS est bien active partout.

Construis ensuite par **jalons**. À la fin de chaque jalon, arrête-toi, résume ce qui est fait et vérifie les critères d'acceptation avant de continuer.

## M0 — Scaffold + Design System
`create-next-app` (App Router, TypeScript, Tailwind, `src/`, alias `@/`). Ajouter `@supabase/ssr` + `@supabase/supabase-js` + TanStack Query + Zustand + `d3-hierarchy` + `lucide-react`. **Intégrer le design system AVANT toute UI** : copier `tokens.css`, brancher `globals.css` (thème Tailwind v4 `@theme`, ou config v3 selon la version installée — vérifier), charger `JetBrains Mono` via `next/font/google` (Helvetica Neue = system, rien à charger). `src/lib/slugs.ts` créé.
*Acceptation : `next dev` démarre, une page témoin utilise `bg-surface text-ink`, `text-wbs`, `font-mono` — les tokens répondent. Aucune couleur en dur.*

## M1 — Auth & données (SSR)
Trois clients Supabase (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`) + `middleware.ts` racine qui rafraîchit la session. Écran `/login` (magic link), création auto du profil par le trigger. Providers (TanStack Query) dans le `layout.tsx` racine. Les pages RSC lisent via le client serveur ; les Client Components via les hooks `lib/queries/`.
*Acceptation : login par magic link OK, session persistée entre rechargements et navigations, `profiles` peuplé, une page RSC protégée renvoie bien les données du user connecté (RLS respectée).*

## M2 — Filesystem & projets
Sidebar : dossiers imbriquables + liste de projets avec pastille de statut (draft/published/shared). Création de dossier et de projet (le trigger bootstrape 6-Pack + gouvernance + racines). Cycle de vie : brouillon → publier → partager.
*Acceptation : je crée un dossier, un projet, je le vois en brouillon, je le publie.*

## M3 — 6-Pack
Blocs : Contexte, Objectifs, Résultats/livrables, Parties prenantes (nom + rôle), Jalons (label + date), **Périmètre — deux listes IN / OUT**, Contraintes & risques. Édition inline (PMO) ; lecture seule sinon. Persistance dans `sixpacks` (prose) / `sixpack_items` (kinds incl. `scope_in`, `scope_out`).
*Acceptation : je remplis le 6-Pack dont le périmètre IN/OUT, je recharge, tout est là.*

## M4 — Arbres PBS / WBS / OBS
Composant partagé `BreakdownTree` (slug `breakdown-tree`, **Client Component**) conforme à DESIGN_SYSTEM.md : layout **descendant**, **N1→N4 boîtes numérotées `1.0` / `1.0.1` / `1.0.1.1`** (via `d3-hierarchy`) + **N5 notes libres à tirets** (sans numéro), connecteurs orthogonaux, **canvas pan (glisser) + zoom (molette)**. Nœud `breakdown-node` : filet gauche à la teinte de structure, code mono, méta. **OBS** : chaque nœud = un acteur avec ses **responsabilités** éditables (`meta.responsabilites`). Édition PMO : titres `contenteditable`, `+` ajoute, `–` supprime, notes N5 éditables — via `breakdown_nodes`. Codes calculés depuis la position.
*Acceptation : WBS numéroté 1.0→1.0.1→1.0.1.1 sur 4 niveaux + N5 en tirets ; OBS avec responsabilités par acteur ; zoom/déplacement ; persistance au rechargement.*

## M5 — Gouvernance
Une carte par réunion avec **animateur + scribe identifiés, acteurs, fréquence, durée, objectifs, documents IN et OUT** ; pyramide de pilotage + matrice RACI (R/A/C/I colorés). Édition PMO via jsonb `governance` (forme documentée dans la migration).
*Acceptation : je crée une réunion complète (animateur, scribe, fréquence, durée, objectifs, docs in/out), RACI éditable, tout persiste.*

## M6 — Collaboration & rôles
Modale d'invitation (email + rôle observateur/annotateur) → `project_members`. Volet d'annotations sur un nœud, en **temps réel** (Realtime sur `annotations`), badge de compteur sur les nœuds annotés. L'UI respecte les droits ; la RLS garantit la sécurité. Bonus : présence (curseurs/avatars) via Realtime.
*Acceptation : depuis deux comptes, l'annotateur commente, l'observateur voit sans pouvoir écrire, le PMO édite. Tentative d'écriture non autorisée → refusée par la base.*

## M7 — Exemples
Sur `src/data/examples.ts` (les 2 projets pizza — contenu à reprendre depuis le prototype `cadrage-studio.jsx`), routine `seedExamplesIfEmpty()` qui clone les deux projets dans un dossier « Exemples » à la première connexion.
*Acceptation : un nouveau compte voit d'emblée « Faire une pizza maison » et « Ouvrir une pizzeria » complets.*

## M8 — Finitions & déploiement
Empty states rédigés (voir ton et copie dans DESIGN_SYSTEM/PROJECT_SPEC), responsive mobile, focus clavier, `reduced-motion`, méta/OG. Déploiement Vercel, variables d'env configurées.
*Acceptation : build prod OK, app en ligne, parcours complet cliquable.*

---

Travaille proprement, commits atomiques par jalon. Si une décision d'archi n'est pas tranchée par les fichiers de contexte, propose-moi 2 options courtes avant de coder.
