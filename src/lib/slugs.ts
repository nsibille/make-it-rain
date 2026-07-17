/**
 * Registre des slugs — source UNIQUE de vérité (CLAUDE.md §5).
 * Chaque composant réutilisable a un slug kebab-case stable, utilisé pour :
 * nom de fichier, `data-slug` sur la racine, clé analytics, id de test.
 * Ne jamais dupliquer un slug ; ne jamais renommer sans mettre à jour ce registre.
 */
export const SLUGS = {
  // Design system / primitives
  wordmark: "wordmark",
  button: "button",
  spinner: "spinner",
  skeleton: "skeleton",
  card: "card",
  chip: "chip",
  avatar: "avatar",
  statusBadge: "status-badge",
  metric: "metric",
  progressBar: "progress-bar",
  segmented: "segmented",
  tabs: "tabs",
  field: "field",
  modal: "modal",
  popover: "popover",
  table: "table",
  raciCell: "raci-cell",
  roleRow: "role-row",

  // Compte & auth
  accountMenu: "account-menu",

  // Filesystem & projets
  sidebar: "sidebar",
  folderTree: "folder-tree",
  projectCard: "project-card",

  // 6-Pack
  sixPack: "six-pack",
  sixPackBlock: "six-pack-block",

  // Arbres (PBS / WBS / OBS)
  breakdownTree: "breakdown-tree",
  breakdownNode: "breakdown-node",
  obsNode: "obs-node",

  // Gouvernance
  governanceBoard: "governance-board",
  instanceCard: "instance-card",
  raciMatrix: "raci-matrix",

  // Collaboration
  annotationDrawer: "annotation-drawer",
  inviteModal: "invite-modal",
} as const;

export type Slug = (typeof SLUGS)[keyof typeof SLUGS];
