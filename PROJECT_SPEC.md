# PROJECT_SPEC.md — Cadrage Studio

Spécification fonctionnelle. Le *quoi* et le *pourquoi* ; le *comment* technique est dans CLAUDE.md / DESIGN_SYSTEM.md.

## 1. Intention

Donner au PMO un espace unique pour cadrer un projet **de A à Z** : partir d'un brief structuré, en dériver des vues d'organisation lisibles, et embarquer les parties prenantes sans les laisser tout casser. La valeur tient à la **clarté** de l'output et à la **maîtrise des droits**.

## 2. Personas & rôles

- **PMO (propriétaire)** — construit et pilote. Contrôle total.
- **Annotateur** — invité de l'entreprise ; lit et commente les nœuds, ne modifie rien.
- **Observateur** — invité ; lecture seule.

Un utilisateur peut être PMO sur ses projets et annotateur/observateur sur ceux des autres. Matrice de droits : voir CLAUDE.md §6 (appliquée par la RLS).

## 3. Filesystem

- Dossiers imbriquables pour organiser autant de projets que voulu.
- Dossier système « Exemples » (non supprimable) contenant les deux cas pizza.
- Chaque projet affiche une pastille de statut.

## 4. Cycle de vie d'un projet

`Brouillon` → `Publié` → `Partagé`.

- **Brouillon** : privé, visible du seul propriétaire.
- **Publié** : lisible par les membres de l'organisation (lecture seule pour eux).
- **Partagé** : au moins un invité nominatif avec un rôle. Publier et partager sont réservés au PMO.

## 5. Le 6-Pack (input)

Le brief structuré du PMO. Objectif : réunir **le maximum d'information pertinente et suffisante pour construire les documents d'organisation** (PBS/WBS/OBS/gouvernance) en aval. « 6-Pack » est le nom d'usage de l'artefact ; le jeu de blocs peut dépasser six.

1. **Contexte & enjeux** — pourquoi ce projet, texte libre (optionnel).
2. **Objectifs** — résultats visés, idéalement SMART (liste).
3. **Résultats / livrables attendus** — produits concrets à sortir (liste).
4. **Parties prenantes** — nom + rôle (liste).
5. **Jalons & échéances** — label + date/repère (liste).
6. **Périmètre — IN / OUT** — deux listes : ce qui est **dans** le projet, ce qui en est **explicitement exclu**. Cadre le WBS et évite le scope creep.
7. **Contraintes & risques** — budget, normes, dépendances… texte libre.

Le 6-Pack nourrit le reste : c'est la source à partir de laquelle on construit les arbres. (Correspondance base : blocs prose = `sixpacks.contexte` / `.contraintes` ; listes = `sixpack_items` avec les kinds `objective`, `deliverable`, `stakeholder`, `milestone`, `scope_in`, `scope_out`.)

## 6. Les arborescences (output)

Un composant d'arbre unique, décliné par la sémantique PMP :

- **PBS — Product Breakdown Structure** : de quoi le *produit/résultat* est fait (composants, livrables décomposés). Répond à « qu'est-ce qu'on produit ? ». Boîtes numérotées.
- **WBS — Work Breakdown Structure** : le *travail* à réaliser, en lots et sous-lots. Répond à « qu'est-ce qu'on fait ? ». **Structure verticale, 4 niveaux de boîtes maximum (N1→N4), numérotées `1.0` / `1.0.1` / `1.0.1.1` ; le niveau 5 est du texte libre en tirets sous la dernière boîte** (checklist, notes d'exécution).
- **OBS — Organizational Breakdown Structure** : *qui* est responsable de quoi. Répond à « qui fait ? ». Chaque nœud est un **acteur** et porte explicitement ses **responsabilités** (champ dédié, `meta.responsabilites`) — pas de numérotation décimale, on lit l'acteur et son périmètre de responsabilité.

Numérotation (PBS/WBS) : **N1** = code projet (ex. `PZ-01`) ; **N2** = `1.0`, `2.0`… ; niveaux suivants = code parent + rang (`1.0` → `1.0.1` → `1.0.1.1`). **N5** = notes libres, sans numéro. Codes calculés depuis la position, jamais stockés.

Chaque arbre est éditable de bout en bout par le PMO (ajout, renommage, suppression, repli). Rendu hyper lisible : cartes, connecteurs orthogonaux, codes mono, une teinte par vue.

## 7. Gouvernance

- **Instances / réunions** — pour **chaque réunion**, on explicite : les **acteurs** (dont un **animateur** et un **scribe** identifiés), la **fréquence**, la **durée**, les **objectifs**, et les **documents en entrée (input) et en sortie (output)**. Organisées en pyramide de décision (COPIL → COPROJ → opérationnel). Stockage : `governance.instances` (jsonb), un objet par réunion.
- **Matrice RACI** : lots de travail × rôles, cellules R/A/C/I. Clarifie qui réalise / approuve / est consulté / informé.

## 8. Collaboration

- **Invitation** : le PMO invite par email et attribue observateur ou annotateur.
- **Annotations** : sur n'importe quel nœud d'un arbre, fil de commentaires en **temps réel**. L'annotateur et le PMO écrivent ; l'observateur lit. Badge de compteur sur les nœuds commentés.
- **Présence** (bonus) : voir qui consulte le projet en direct.

## 9. Les deux exemples (livrés d'office)

Thématique unique, deux échelles — pédagogique.

- **🍕 Faire une pizza maison** — dîner pour 4. Cas simple et parlant : montre le mécanisme 6-Pack → PBS/WBS/OBS → gouvernance sur un objet trivial.
- **🏪 Ouvrir une pizzeria** — lancement à 6 mois. Même thème à l'échelle entreprise : financement, travaux, légal, recrutement, ouverture — montre l'outil « pour de vrai ».

Contenu détaillé des deux cas : disponible dans le prototype `cadrage-studio.jsx` (objet `pizzaMaison` et `pizzeria`), à porter dans `src/data/examples.ts`.

## 10. Hors périmètre (v1)

Diagramme de Gantt / planning temporel, gestion budgétaire chiffrée, export PDF avancé, notifications email. À garder en tête pour la roadmap mais non requis pour la v1.
