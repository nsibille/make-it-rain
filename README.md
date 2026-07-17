# Cadrage Studio

Outil de cadrage projet pour PMO : on entre un brief structuré (le **6-Pack**),
l'app produit des **arborescences** claires (PBS, WBS, OBS) et un **schéma de
gouvernance**, partageables avec des collègues en lecture ou en annotation.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Supabase (`@supabase/ssr` —
Auth / RLS / Realtime) · TanStack Query · Zustand · `d3-hierarchy` ·
lucide-react. Déploiement Vercel.

Le design system est piloté par les tokens `src/styles/tokens.css` (mappés en
thème Tailwind dans `src/app/globals.css`). Aucune couleur/typo n'est codée en
dur.

## Développement local

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables Supabase
npm run dev                  # http://localhost:3000
```

Variables (`.env.local`) :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publiable (jamais la service role) |
| `NEXT_PUBLIC_SITE_URL` | (optionnel) URL publique, pour les métadonnées |

## Base de données

Le schéma vit dans `supabase/migrations/` :

- `0001_init.sql` — tables, enums, triggers (`bootstrap_project`,
  `handle_new_user`), RLS complète, publication Realtime.
- `0002_harden_functions.sql` — durcissement (search_path, exposition RPC).

À appliquer sur un projet Supabase vierge (via le MCP Supabase
`apply_migration`, ou la CLI `supabase db push`). La sécurité des rôles
(PMO / annotateur / observateur) est appliquée par la **RLS Postgres**, pas
seulement par l'UI.

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel (framework détecté : Next.js).
2. Renseigner les variables d'environnement du projet Vercel :
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, et
   `NEXT_PUBLIC_SITE_URL` (l'URL de production).
3. Déployer.
4. Dans **Supabase → Authentication → URL Configuration** :
   - **Site URL** = l'URL de production (ex. `https://cadrage-studio.vercel.app`).
   - **Redirect URLs** : ajouter `<URL de prod>/auth/callback`.
   Sans cela, le lien magique de connexion ne redirige pas correctement.

À la première connexion d'un compte, les deux projets d'exemple
(« Faire une pizza maison », « Ouvrir une pizzeria ») sont clonés dans un
dossier « Exemples ».

## Rôles & droits

| Action | PMO (owner) | Annotateur | Observateur |
|---|:-:|:-:|:-:|
| Voir le projet | ✅ | ✅ | ✅ |
| Éditer 6-Pack / arbres / gouvernance | ✅ | ❌ | ❌ |
| Annoter un nœud | ✅ | ✅ | ❌ |
| Inviter / publier / partager | ✅ | ❌ | ❌ |

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```
