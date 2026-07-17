/* ============================================================
   examples.ts — contenu des 2 projets « Exemples » (seed M7).
   Cloné dans le compte de l'utilisateur à la première connexion
   (cf. CLAUDE_CODE_PROMPT.md · M7, via une Server Action).

   Conforme au schéma final :
   - 6-Pack : prose (contexte, contraintes) + listes (dont périmètre IN/OUT)
   - Arbres : nesting par position ; les CODES (1.0 / 1.0.1 / 1.0.1.1) sont
     calculés au rendu, jamais stockés. Profondeur = niveau :
       root=N1 · enfants=N2 (x.0) · N3 · N4 · N5 = notes libres (tirets).
   - OBS : chaque nœud porte meta.responsabilites (et meta.acteur).
   - Gouvernance : une réunion = animateur, scribe, acteurs, fréquence,
     durée, objectifs, docs_in, docs_out.
   ============================================================ */

export type Stakeholder = { name: string; role: string };
export type Milestone = { label: string; date: string };
export type Scope = { in: string[]; out: string[] };

export type Sixpack = {
  contexte: string;
  objectifs: string[];
  livrables: string[];
  parties_prenantes: Stakeholder[];
  jalons: Milestone[];
  perimetre: Scope;
  contraintes: string;
};

export type NodeMeta = {
  acteur?: string;
  responsabilites?: string;
  free?: boolean; // note libre N5 (indicatif ; le rendu se fie surtout à la profondeur)
};
export type TreeNode = {
  name: string;
  meta?: NodeMeta;
  children?: TreeNode[];
};

export type GovInstance = {
  name: string;
  animateur: string;
  scribe: string;
  acteurs: string[];
  frequence: string;
  duree: string;
  objectifs: string[];
  docs_in: string[];
  docs_out: string[];
};
export type RaciValue = "R" | "A" | "C" | "I" | "-";
export type Governance = {
  instances: GovInstance[];
  raci: { roles: string[]; lots: { name: string; v: RaciValue[] }[] };
};

export type ExampleProject = {
  slug: string;
  code: string; // code racine N1, ex. "PZ-01"
  name: string;
  emoji: string;
  status: "draft" | "published" | "shared";
  sixpack: Sixpack;
  pbs: TreeNode;
  wbs: TreeNode;
  obs: TreeNode;
  governance: Governance;
};

/* ─────────────────────────────────────────────────────────────
   PZ-02 · Faire une pizza maison (cas pédagogique)
   ───────────────────────────────────────────────────────────── */
const pizzaMaison: ExampleProject = {
  slug: "faire-une-pizza-maison",
  code: "PZ-02",
  name: "Faire une pizza maison",
  emoji: "🍕",
  status: "published",
  sixpack: {
    contexte:
      "Recevoir 4 amis vendredi soir. Faire soi-même plutôt que commander : budget maîtrisé, plaisir de cuisiner, zéro stress au moment du service.",
    objectifs: [
      "Servir 2 pizzas maison réussies à 20h30",
      "Coût total < 15 €",
      "Cuisine rangée avant l'arrivée des invités",
    ],
    livrables: [
      "Pâte maison reposée 2h",
      "Pizza Margherita cuite",
      "Pizza Reine cuite",
      "Table dressée pour 5",
    ],
    parties_prenantes: [
      { name: "Moi", role: "Chef de cuisine" },
      { name: "Léa", role: "Sous-chef" },
      { name: "Invités (×4)", role: "Convives" },
      { name: "Épicier du coin", role: "Fournisseur" },
    ],
    jalons: [
      { label: "Courses", date: "J-1" },
      { label: "Pâte lancée", date: "J · 17h00" },
      { label: "Garniture", date: "J · 19h00" },
      { label: "Cuisson", date: "J · 20h00" },
      { label: "Service", date: "J · 20h30" },
    ],
    perimetre: {
      in: ["2 pizzas maison", "Boissons", "Dessert simple"],
      out: ["Entrée", "Pain maison", "Livraison / commande extérieure"],
    },
    contraintes:
      "Four domestique 250 °C max. Pâte à lancer 2h à l'avance. Un invité végétarien (Reine à adapter).",
  },
  pbs: {
    name: "Dîner pizza réussi",
    children: [
      {
        name: "Pizzas",
        children: [{ name: "Pâte (base commune)" }, { name: "Margherita" }, { name: "Reine" }],
      },
      {
        name: "Accompagnements",
        children: [{ name: "Boissons" }, { name: "Salade verte" }, { name: "Dessert" }],
      },
      {
        name: "Mise en table",
        children: [{ name: "Couverts & assiettes" }, { name: "Ambiance (musique, lumière)" }],
      },
    ],
  },
  wbs: {
    name: "Faire une pizza maison",
    children: [
      {
        name: "Préparation",
        children: [
          {
            name: "Menu & courses",
            children: [
              { name: "Établir le menu" },
              {
                name: "Faire les courses",
                children: [
                  { name: "Vérifier le stock de farine", meta: { free: true } },
                  { name: "Acheter mozzarella di bufala", meta: { free: true } },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "Pâte",
        children: [{ name: "Pétrir" }, { name: "Laisser reposer 2h" }, { name: "Étaler" }],
      },
      {
        name: "Garniture & cuisson",
        children: [
          { name: "Préparer sauce & toppings" },
          { name: "Garnir les pizzas" },
          {
            name: "Cuire",
            children: [{ name: "Préchauffer le four" }, { name: "Enfourner & surveiller" }],
          },
        ],
      },
      {
        name: "Service",
        children: [{ name: "Dresser la table" }, { name: "Servir & ranger" }],
      },
    ],
  },
  obs: {
    name: "Soirée pizza",
    children: [
      {
        name: "Chef · Moi",
        meta: { acteur: "Moi", responsabilites: "Pâte, cuisson, coordination générale et timing." },
        children: [
          {
            name: "Cuisson",
            meta: { acteur: "Moi", responsabilites: "Préchauffe, enfournage, surveillance de cuisson." },
          },
        ],
      },
      {
        name: "Sous-chef · Léa",
        meta: { acteur: "Léa", responsabilites: "Garnitures, découpe, dressage, vaisselle." },
      },
      {
        name: "Intendance",
        meta: { acteur: "Moi + Invités", responsabilites: "Courses, boissons, dessert." },
      },
    ],
  },
  governance: {
    instances: [
      {
        name: "Brief apéro",
        animateur: "Moi",
        scribe: "Léa",
        acteurs: ["Moi", "Léa"],
        frequence: "J-1 (ponctuel)",
        duree: "15 min",
        objectifs: ["Valider le menu et le budget", "Répartir les courses"],
        docs_in: ["Liste d'invités", "Budget indicatif"],
        docs_out: ["Menu validé", "Liste de courses"],
      },
      {
        name: "Point cuisine",
        animateur: "Moi",
        scribe: "Léa",
        acteurs: ["Moi", "Léa"],
        frequence: "Jour J · 19h",
        duree: "5 min",
        objectifs: ["Se caler sur la garniture et la cuisson"],
        docs_in: ["Menu validé"],
        docs_out: ["Top départ cuisson"],
      },
      {
        name: "Retour d'expérience",
        animateur: "Léa",
        scribe: "Moi",
        acteurs: ["Moi", "Léa", "Invités"],
        frequence: "J+1",
        duree: "10 min",
        objectifs: ["Identifier ce qu'on améliore la prochaine fois"],
        docs_in: [],
        docs_out: ["Notes d'amélioration"],
      },
    ],
    raci: {
      roles: ["Chef", "Sous-chef", "Invités"],
      lots: [
        { name: "Menu & courses", v: ["A", "C", "I"] },
        { name: "Pâte", v: ["R", "C", "-"] },
        { name: "Garniture", v: ["C", "R", "-"] },
        { name: "Cuisson", v: ["R", "C", "-"] },
        { name: "Service & rangement", v: ["A", "R", "C"] },
      ],
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   PZ-01 · Ouvrir une pizzeria (cas à l'échelle entreprise)
   ───────────────────────────────────────────────────────────── */
const pizzeria: ExampleProject = {
  slug: "ouvrir-une-pizzeria",
  code: "PZ-01",
  name: "Ouvrir une pizzeria",
  emoji: "🏪",
  status: "shared",
  sixpack: {
    contexte:
      "Ouverture d'une pizzeria artisanale de 30 couverts dans le 11e à Paris. Marché porteur mais concurrence forte : la différenciation se joue sur la qualité produit et l'expérience en salle.",
    objectifs: [
      "Ouvrir dans 6 mois",
      "Atteindre le seuil de rentabilité à M+9",
      "Note Google ≥ 4,5",
      "Ticket moyen 22 €",
    ],
    livrables: [
      "Local aménagé et aux normes ERP",
      "Carte et sourcing arrêtés",
      "Équipe recrutée et formée",
      "Licences et autorisations obtenues",
      "Plan marketing d'ouverture",
    ],
    parties_prenantes: [
      { name: "Fondateur", role: "Gérant / sponsor" },
      { name: "Chef pizzaïolo", role: "Exploitation" },
      { name: "Investisseurs", role: "Financement" },
      { name: "Mairie / ERP", role: "Autorité" },
      { name: "Fournisseurs", role: "Sourcing" },
      { name: "Comptable", role: "Support finances" },
    ],
    jalons: [
      { label: "Bail signé", date: "M0" },
      { label: "Travaux lancés", date: "M2" },
      { label: "Recrutement", date: "M4" },
      { label: "Licences OK", date: "M5" },
      { label: "Soft opening", date: "M5,5" },
      { label: "Ouverture", date: "M6" },
    ],
    perimetre: {
      in: ["Service sur place (30 couverts)", "Vente à emporter", "Carte pizzas + desserts"],
      out: ["Livraison (phase 2)", "Franchise", "Cuisine centrale", "Bar à cocktails"],
    },
    contraintes:
      "Budget 85 k€. Normes ERP catégorie 5. Délai fournisseur du four à bois. Trésorerie tendue avant ouverture. Autorisation de terrasse incertaine.",
  },
  pbs: {
    name: "Pizzeria opérationnelle",
    children: [
      {
        name: "Local",
        children: [
          { name: "Cuisine (four, froid, plonge)" },
          { name: "Salle (mobilier, comptoir)" },
          { name: "Sanitaires & normes ERP" },
        ],
      },
      {
        name: "Offre",
        children: [{ name: "Carte pizzas" }, { name: "Boissons & desserts" }, { name: "Caisse & menus" }],
      },
      {
        name: "Marque",
        children: [
          { name: "Identité visuelle" },
          { name: "Site & réseaux" },
          { name: "Enseigne & signalétique" },
        ],
      },
      {
        name: "Cadre légal",
        children: [
          { name: "Licences" },
          { name: "Autorisations ERP / terrasse" },
          { name: "Contrats (bail, fournisseurs)" },
        ],
      },
    ],
  },
  wbs: {
    name: "Ouvrir une pizzeria",
    children: [
      {
        name: "Cadrage & financement",
        children: [{ name: "Business plan" }, { name: "Levée de fonds" }, { name: "Création de la société" }],
      },
      {
        name: "Local & travaux",
        children: [
          {
            name: "Bail & légal local",
            children: [
              { name: "Négocier le bail" },
              {
                name: "Signer le bail",
                children: [
                  { name: "Vérifier la clause travaux", meta: { free: true } },
                  { name: "Dépôt de garantie 3 mois", meta: { free: true } },
                ],
              },
            ],
          },
          {
            name: "Aménagement",
            children: [{ name: "Plomberie" }, { name: "Électricité" }, { name: "Conformité ERP" }],
          },
          {
            name: "Équipements",
            children: [{ name: "Four à bois" }, { name: "Froid & plonge" }],
          },
        ],
      },
      {
        name: "Offre & sourcing",
        children: [
          { name: "Concevoir la carte" },
          { name: "Référencer les fournisseurs" },
          { name: "Tester les recettes" },
        ],
      },
      {
        name: "Équipe",
        children: [{ name: "Recruter" }, { name: "Former" }, { name: "Planifier les shifts" }],
      },
      {
        name: "Légal & conformité",
        children: [{ name: "Licences & déclarations" }, { name: "Hygiène (HACCP)" }, { name: "Assurances" }],
      },
      {
        name: "Marketing & ouverture",
        children: [
          { name: "Identité & site" },
          { name: "Pré-ouverture & communauté" },
          { name: "Soft opening" },
          { name: "Ouverture officielle" },
        ],
      },
    ],
  },
  obs: {
    name: "Projet Pizzeria",
    children: [
      {
        name: "Direction · Fondateur",
        meta: {
          acteur: "Fondateur",
          responsabilites: "Pilotage global, financement, arbitrages, relation investisseurs.",
        },
        children: [
          {
            name: "Pilotage & finance",
            meta: { acteur: "Fondateur", responsabilites: "Budget, trésorerie, reporting au COPIL." },
          },
        ],
      },
      {
        name: "Exploitation · Chef pizzaïolo",
        meta: {
          acteur: "Chef pizzaïolo",
          responsabilites: "Carte, sourcing, cuisine, encadrement de l'équipe cuisine.",
        },
        children: [
          {
            name: "Équipe de salle",
            meta: { acteur: "Maître de salle", responsabilites: "Service, encaissement, expérience client." },
          },
        ],
      },
      {
        name: "Support",
        children: [
          {
            name: "Comptable",
            meta: { acteur: "Comptable", responsabilites: "Comptabilité, paie, déclarations sociales et fiscales." },
          },
          {
            name: "Agence marketing",
            meta: { acteur: "Agence", responsabilites: "Identité, site, campagne d'ouverture." },
          },
          {
            name: "Maître d'œuvre",
            meta: { acteur: "Maître d'œuvre", responsabilites: "Coordination des travaux, conformité ERP, réception de chantier." },
          },
        ],
      },
    ],
  },
  governance: {
    instances: [
      {
        name: "Comité de pilotage (COPIL)",
        animateur: "Fondateur",
        scribe: "Comptable",
        acteurs: ["Fondateur", "Investisseurs", "Comptable"],
        frequence: "Mensuel",
        duree: "60 min",
        objectifs: ["Arbitrer budget et planning", "Valider les jalons", "Décider sur les risques majeurs"],
        docs_in: ["Reporting d'avancement", "Suivi budgétaire", "Registre des risques"],
        docs_out: ["Relevé de décisions", "Budget réajusté"],
      },
      {
        name: "Comité projet (COPROJ)",
        animateur: "Fondateur",
        scribe: "Maître d'œuvre",
        acteurs: ["Fondateur", "Maître d'œuvre", "Chef pizzaïolo"],
        frequence: "Hebdomadaire",
        duree: "45 min",
        objectifs: ["Suivre l'avancement des chantiers", "Lever les blocages"],
        docs_in: ["Planning travaux", "Comptes-rendus fournisseurs"],
        docs_out: ["Actions de la semaine", "Plan de rattrapage"],
      },
      {
        name: "Stand-up ouverture",
        animateur: "Chef pizzaïolo",
        scribe: "Maître de salle",
        acteurs: ["Équipe complète"],
        frequence: "Quotidien (M-1)",
        duree: "15 min",
        objectifs: ["Coordonner la mise en route opérationnelle"],
        docs_in: ["Checklist d'ouverture"],
        docs_out: ["Points bloquants du jour"],
      },
    ],
    raci: {
      roles: ["Fondateur", "Chef", "Support"],
      lots: [
        { name: "Financement", v: ["A", "I", "C"] },
        { name: "Travaux", v: ["A", "C", "R"] },
        { name: "Carte & sourcing", v: ["C", "R", "I"] },
        { name: "Recrutement", v: ["A", "R", "C"] },
        { name: "Légal & conformité", v: ["A", "I", "R"] },
        { name: "Ouverture", v: ["A", "R", "C"] },
      ],
    },
  },
};

/* Ordre d'affichage : le cas simple d'abord (pédagogie), puis l'échelle entreprise. */
export const EXAMPLE_PROJECTS: ExampleProject[] = [pizzaMaison, pizzeria];
