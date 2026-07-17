# DESIGN_SYSTEM.md — Cadrage Studio

> **Source de vérité visuelle = le Design System généré (Claude Design).**
> Tokens : `src/styles/tokens.css` → thème Tailwind : `src/app/globals.css`.
> Référence complète (couleurs, composants, patterns) : `design/design-system-reference.html`.
> Ce fichier ne **redéfinit pas** couleurs/typo : il en rappelle l'usage et fige la **couche métier** (arbres, gouvernance) que le code doit respecter.

Direction : instrument de planification dense, **oklch low-chroma**, chaque sens = une teinte stable. Base 4px, densité forte. Ne coder aucune couleur/taille en dur : lire les tokens.

## Typographie

- **Sans (display + corps)** : `Helvetica Neue` (system stack) — aucune webfont à charger.
- **Mono (labels, codes, méta)** : `JetBrains Mono` via `next/font/google`.
- Échelle (tokens `--text-*`) : display 32/600/-0.025em · titre 24/600/-0.02em · section 16/600 · corps 13/400 · légende 11.5 · micro 10 · nano 8.5. Labels mono en MAJUSCULES, `letter-spacing 0.14em`, couleur `--ink-3`.

## Système de teintes (rappel)

Une teinte par sens ; tints dérivés par la recette en tête de `tokens.css`.

| Sens | Token | Hue |
|---|---|---|
| PBS / Produit | `--pbs` | h200 cyan |
| WBS / Travail | `--wbs` | h268 indigo |
| OBS / Organisation | `--obs` | h330 magenta |
| RACI — R / A / C / I | `--raci-r/a/c/i` | h255 / h292 / h165 / h75 |
| État — en cours / bloqué / attente / terminé | `--status-*` | h255 / h25 / h75 / h150 |
| Risque — faible / moyen / élevé | `--risk-*` | h150 / h75 / h25 |

Action primaire = encre (`--brand` = `--ink`), pas de couleur d'accent tape-à-l'œil. Draft = neutre `--ink-4`.

## Formes

Rayons (tokens) : `--radius-chip` 4 (cellules, chips) · `--radius-node` 6 (nœuds, boutons) · `--radius-pop` 8 (popovers, modals). Ombres : `--shadow-1` (nœuds/boutons) · `--shadow-2` (popovers/modals).

## Nœud de graphe (`breakdown-node`) — brique élémentaire

Carte blanche, `border --border`, **filet gauche 3px à la teinte de la structure** (PBS/WBS/OBS), rayon 6, ombre `--shadow-1`. Contenu : ligne code mono nano (`WBS · 2.0`) + pastille d'état optionnelle ; titre 12.5/600 ; méta compacte (avatar-chip rôle, catégorie, %). Trois tailles selon la profondeur. Racine (N1) = fond plein `--ink`, texte blanc. Nœud « + Ajouter » = **bordure tiretée** `--border-strong`, fond `--surface-2`.

## Arbre / graphe (`breakdown-tree`) — spec (remplace toute version antérieure)

**Client Component.** Layout **descendant (top-down)**, pas horizontal.

- **Niveaux & numérotation** : **N1→N4 = boîtes structurantes numérotées** (calcul de position via `d3-hierarchy` `tree()`, orientation verticale par défaut). Format des codes : **N1** = code projet (`PZ-01`) ; **N2** = `1.0`, `2.0`… ; puis code parent + rang → `1.0` → `1.0.1` → `1.0.1.1`. Au-delà, **N5 = « niveau libre »** : notes éditables en liste à tirets sous le nœud N4, **sans numéro**. (Le schéma `breakdown_nodes` autorise n'importe quelle profondeur — N5 est une **convention de rendu**.) Codes calculés depuis la position, jamais stockés. Numérotation appliquée à **PBS/WBS** ; l'**OBS** affiche acteur + responsabilités (cf. plus bas).
- **Connecteurs orthogonaux** nets, tracés SVG derrière les cartes, `stroke --graph-connector` (#D3D6DA) `1px`. Coudes verticaux entre niveaux.
- **Canvas** : conteneur `border --border`, rayon 8, `overflow:hidden`. **Pan** (glisser, `cursor:grab`) + **zoom molette** via `transform: translate() scale()` sur le contenu (`transform-origin:0 0`). Légende de niveaux N1–N5 en marge gauche (mono nano `--ink-4`).
- **Édition PMO** : titres `contenteditable` (focus → fond `--surface-2`) ; `+` ajoute un enfant ; `–` supprime ; notes N5 éditables à la volée. Réservé au rôle pmo (cf. CLAUDE.md §6).
- **Annotations** : badge compteur sur les nœuds commentés ; clic → volet.

Le WBS est la **sortie principale** du cadrage. Exemple de référence dans le DS : *Ouvrir une pizzeria (PZ-01)*.

## Gouvernance

- **Instances / réunions** : une carte par réunion, affichant **animateur** et **scribe** (badges distincts), les autres **acteurs**, la **fréquence**, la **durée**, les **objectifs**, et deux listes **Documents IN** / **Documents OUT**. Deux niveaux de pilotage (instance → équipes opérationnelles) reliés.
- **Nœud OBS** (`obs-node`) : un **acteur** par nœud, avec badge RACI, effectif, et surtout ses **responsabilités** explicites (bloc texte/liste sous le titre, `meta.responsabilites`). C'est la valeur de l'OBS : lisible « qui porte quoi ».
- **Matrice RACI** : lots × rôles, cellules R/A/C/I en pastilles (soft bg + texte teinté via `--raci-*-soft` / `--raci-*-text`).

## Primitives d'UI (d'après le DS)

`Button` (primary encre / hover `--ink-1` ; secondary blanc `border-strong` ; ghost ; danger `--danger`), `Chip`, `StatusBadge` (dot + label), `Metric` (mono label + grand chiffre), `ProgressBar` (piste `--border-soft` + remplissage teinté), `Segmented`/`Tabs`, `Field` (input/label mono uppercase, dates en mono), `Modal`/`Popover` (`--shadow-2`), `Table` (en-têtes mono uppercase, lignes hover `#FCFCFD`), `RoleRow` (PMO / Annotateur / Observateur avec badge).

Tout composant réutilisable porte `data-slug` (CLAUDE.md §5). Réimplémenter en React depuis la référence — **ne pas** importer le HTML statique ni `support.js` (runtime de preview Claude Design).

## Écriture d'interface

Français, dense, voix active. Le bouton dit l'action, le toast la confirme (« Publier » → « Projet publié »). Empty state = invitation à agir (« Construisez votre WBS — ajoutez un premier lot »). Erreurs précises, sans excuse.

## Plancher qualité

Responsive jusqu'au mobile (sidebar en tiroir, canvas de graphe scrollable/zoomable au doigt). Focus clavier visible. `prefers-reduced-motion` respecté. Contraste AA.
