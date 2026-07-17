/** Onglets de la vue projet, dans l'ordre du flux de cadrage. */
export const PROJECT_VIEWS = [
  { slug: "six-pack", label: "6-Pack" },
  { slug: "pbs", label: "PBS" },
  { slug: "wbs", label: "WBS" },
  { slug: "obs", label: "OBS" },
  { slug: "governance", label: "Gouvernance" },
] as const;

export type ProjectViewSlug = (typeof PROJECT_VIEWS)[number]["slug"];
