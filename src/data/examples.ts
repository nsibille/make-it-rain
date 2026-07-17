import type { Instance, Raci } from "@/features/governance/data";

/**
 * Les deux exemples pizza (seed). Contenu rédigé pour la démo : même thème,
 * deux échelles. À cloner dans un dossier « Exemples » à la 1re connexion.
 * (Le prototype cadrage-studio.jsx d'origine n'étant pas fourni, ce contenu
 * est une reconstitution cohérente du même esprit.)
 */

export interface ExampleTreeNode {
  name: string;
  meta?: Record<string, unknown>;
  children?: ExampleTreeNode[];
}

export interface ExampleProject {
  name: string;
  emoji: string;
  sixpack: {
    contexte: string;
    contraintes: string;
    objectives: string[];
    deliverables: string[];
    scope_in: string[];
    scope_out: string[];
    stakeholders: { name: string; role: string }[];
    milestones: { name: string; date: string }[];
  };
  pbs: ExampleTreeNode;
  wbs: ExampleTreeNode;
  obs: ExampleTreeNode;
  governance: { instances: Instance[]; raci: Raci };
}

const resp = (responsabilites: string) => ({ responsabilites });

// ── 🍕 Faire une pizza maison ─────────────────────────────
const pizzaMaison: ExampleProject = {
  name: "Faire une pizza maison",
  emoji: "🍕",
  sixpack: {
    contexte:
      "Préparer un dîner pizza maison pour 4 personnes ce soir : bon, convivial et sans stress.",
    contraintes:
      "Budget ~20 €. Four ménager (max 250 °C). Un convive sans gluten. Prêt pour 20 h.",
    objectives: [
      "Servir 4 pizzas réussies à 20 h",
      "Rester sous 20 € de budget",
      "Proposer une option sans gluten",
    ],
    deliverables: [
      "Pâte à pizza reposée",
      "Sauce tomate maison",
      "Pizzas cuites (dont une sans gluten)",
      "Table dressée",
    ],
    scope_in: [
      "Pizzas margherita et légumes",
      "Préparation maison de la pâte et de la sauce",
      "Dressage de la table",
    ],
    scope_out: [
      "Dessert et boissons alcoolisées",
      "Pizza à emporter / livraison",
      "Vaisselle du lendemain",
    ],
    stakeholders: [
      { name: "Chef (moi)", role: "Cuisinier" },
      { name: "Sous-chef", role: "Aide" },
      { name: "Convive végétarien", role: "Invité" },
      { name: "Convive sans gluten", role: "Invité" },
    ],
    milestones: [
      { name: "Courses terminées", date: "2026-07-17" },
      { name: "Pâte prête (repos 1 h)", date: "2026-07-17" },
      { name: "Cuisson", date: "2026-07-17" },
      { name: "Service", date: "2026-07-17" },
    ],
  },
  pbs: {
    name: "Dîner pizza",
    children: [
      {
        name: "Pâte",
        children: [
          {
            name: "Base classique",
            children: [
              {
                name: "Farine T55",
                children: [{ name: "500 g" }, { name: "Tamiser" }],
              },
            ],
          },
          { name: "Base sans gluten" },
        ],
      },
      {
        name: "Garnitures",
        children: [
          { name: "Sauce tomate" },
          { name: "Mozzarella" },
          { name: "Légumes" },
          { name: "Basilic" },
        ],
      },
      {
        name: "Pizzas",
        children: [
          { name: "Margherita" },
          { name: "Légumes" },
          { name: "Sans gluten" },
        ],
      },
      {
        name: "Table",
        children: [{ name: "Couverts" }, { name: "Boissons" }],
      },
    ],
  },
  wbs: {
    name: "Faire le dîner pizza",
    children: [
      {
        name: "Préparer",
        children: [
          { name: "Faire les courses" },
          {
            name: "Préparer la pâte",
            children: [
              {
                name: "Pétrir",
                children: [{ name: "10 min" }, { name: "Repos 1 h" }],
              },
            ],
          },
          { name: "Préparer la sauce" },
        ],
      },
      {
        name: "Garnir",
        children: [
          { name: "Étaler la pâte" },
          { name: "Garnir margherita" },
          { name: "Garnir légumes" },
        ],
      },
      {
        name: "Cuire",
        children: [
          { name: "Préchauffer le four" },
          { name: "Enfourner" },
          { name: "Surveiller la cuisson" },
        ],
      },
      {
        name: "Servir",
        children: [{ name: "Dresser la table" }, { name: "Servir chaud" }],
      },
    ],
  },
  obs: {
    name: "Organisation",
    children: [
      {
        name: "Chef (moi)",
        meta: resp("Pilote le dîner, prépare la pâte et gère la cuisson."),
      },
      {
        name: "Sous-chef",
        meta: resp("Prépare les garnitures et dresse la table."),
      },
      {
        name: "Intendance",
        meta: resp("Courses et respect du budget."),
      },
    ],
  },
  governance: {
    instances: [
      {
        name: "Point cuisine",
        animateur: "Chef (moi)",
        scribe: "Sous-chef",
        acteurs: ["Chef (moi)", "Sous-chef"],
        frequence: "Unique",
        duree: "10 min",
        objectif: "Répartir les tâches et valider le timing du dîner.",
        docs_in: ["Liste de courses", "Recettes"],
        docs_out: ["Planning de cuisson"],
      },
    ],
    raci: {
      roles: ["Chef", "Sous-chef", "Invités"],
      lots: [
        { name: "Courses", v: ["A", "R", "I"] },
        { name: "Pâte", v: ["R", "C", "I"] },
        { name: "Garnitures", v: ["C", "R", "I"] },
        { name: "Cuisson", v: ["R", "C", "I"] },
        { name: "Service", v: ["A", "R", "C"] },
      ],
    },
  },
};

// ── 🏪 Ouvrir une pizzeria ────────────────────────────────
const pizzeria: ExampleProject = {
  name: "Ouvrir une pizzeria",
  emoji: "🏪",
  sixpack: {
    contexte:
      "Ouvrir une pizzeria de quartier (30 couverts) d'ici 6 mois : financement, travaux, légal, recrutement et ouverture.",
    contraintes:
      "Budget 120 k€. Bail à signer sous 2 mois. Normes ERP et hygiène (HACCP). Ouverture avant la rentrée.",
    objectives: [
      "Ouvrir dans 6 mois",
      "Rester sous 120 k€ d'investissement",
      "Atteindre 60 couverts/jour à 3 mois",
      "Obtenir toutes les autorisations légales",
    ],
    deliverables: [
      "Local aménagé et équipé",
      "Licences et autorisations",
      "Équipe recrutée et formée",
      "Carte et fournisseurs sélectionnés",
      "Plan de communication d'ouverture",
    ],
    scope_in: [
      "Restauration sur place et à emporter",
      "Pizzas au feu de bois",
      "Recrutement d'une équipe de 5",
      "Aménagement du local",
    ],
    scope_out: [
      "Livraison à domicile (phase 2)",
      "Franchise / second établissement",
      "Vente de produits en épicerie",
    ],
    stakeholders: [
      { name: "Gérant", role: "Porteur de projet" },
      { name: "Chef pizzaïolo", role: "Production" },
      { name: "Expert-comptable", role: "Finance" },
      { name: "Architecte", role: "Travaux" },
      { name: "Banque", role: "Financement" },
      { name: "Mairie", role: "Autorisations" },
    ],
    milestones: [
      { name: "Bail signé", date: "2026-08-15" },
      { name: "Financement obtenu", date: "2026-09-01" },
      { name: "Travaux terminés", date: "2026-11-30" },
      { name: "Équipe recrutée", date: "2026-12-15" },
      { name: "Ouverture", date: "2027-01-10" },
    ],
  },
  pbs: {
    name: "Pizzeria",
    children: [
      {
        name: "Local",
        children: [
          { name: "Salle (30 couverts)" },
          {
            name: "Cuisine",
            children: [
              {
                name: "Four à bois",
                children: [{ name: "Feu de bois" }, { name: "Certifié ERP" }],
              },
            ],
          },
          { name: "Sanitaires" },
        ],
      },
      {
        name: "Offre",
        children: [
          { name: "Carte pizzas" },
          { name: "Boissons" },
          { name: "Desserts" },
        ],
      },
      {
        name: "Légal",
        children: [
          { name: "Licence restauration" },
          { name: "Enregistrement HACCP" },
          { name: "Assurances" },
        ],
      },
      {
        name: "Marque",
        children: [
          { name: "Nom & logo" },
          { name: "Site & réseaux sociaux" },
        ],
      },
    ],
  },
  wbs: {
    name: "Ouvrir la pizzeria",
    children: [
      {
        name: "Financer",
        children: [
          { name: "Business plan" },
          { name: "Prêt bancaire" },
          { name: "Aides & subventions" },
        ],
      },
      {
        name: "Aménager",
        children: [
          { name: "Signer le bail" },
          {
            name: "Travaux",
            children: [
              {
                name: "Gros œuvre",
                children: [{ name: "Devis validé" }, { name: "Permis déposé" }],
              },
            ],
          },
          { name: "Équipement cuisine" },
        ],
      },
      {
        name: "Légaliser",
        children: [
          { name: "Créer la société" },
          { name: "Obtenir les licences" },
          { name: "Plan HACCP" },
        ],
      },
      {
        name: "Recruter",
        children: [
          { name: "Chef pizzaïolo" },
          { name: "Équipe de salle" },
          { name: "Formation hygiène" },
        ],
      },
      {
        name: "Lancer",
        children: [
          { name: "Communication" },
          { name: "Soft opening" },
          { name: "Inauguration" },
        ],
      },
    ],
  },
  obs: {
    name: "Organisation",
    children: [
      {
        name: "Gérant",
        meta: resp("Pilotage global, financement et décisions stratégiques."),
        children: [
          {
            name: "Chef pizzaïolo",
            meta: resp("Cuisine, carte et hygiène HACCP."),
            children: [
              { name: "Commis", meta: resp("Préparation et aide à la cuisson.") },
            ],
          },
          {
            name: "Responsable salle",
            meta: resp("Service, encaissement et équipe de salle."),
            children: [
              { name: "Serveur", meta: resp("Accueil et service des clients.") },
            ],
          },
        ],
      },
      {
        name: "Expert-comptable (externe)",
        meta: resp("Comptabilité, paie et déclarations légales."),
      },
    ],
  },
  governance: {
    instances: [
      {
        name: "Comité de pilotage (COPIL)",
        animateur: "Gérant",
        scribe: "Expert-comptable",
        acteurs: ["Gérant", "Chef pizzaïolo", "Expert-comptable", "Architecte"],
        frequence: "Mensuel",
        duree: "90 min",
        objectif: "Suivre l'avancement, le budget et les risques du projet.",
        docs_in: ["Tableau de bord", "Suivi budgétaire"],
        docs_out: ["Relevé de décisions", "Plan d'actions"],
      },
      {
        name: "Comité travaux",
        animateur: "Architecte",
        scribe: "Gérant",
        acteurs: ["Architecte", "Gérant", "Entreprise BTP"],
        frequence: "Hebdomadaire",
        duree: "45 min",
        objectif: "Piloter le chantier et lever les blocages.",
        docs_in: ["Planning chantier"],
        docs_out: ["Compte-rendu de chantier"],
      },
      {
        name: "Point opérationnel",
        animateur: "Chef pizzaïolo",
        scribe: "Responsable salle",
        acteurs: ["Chef pizzaïolo", "Responsable salle"],
        frequence: "Hebdomadaire",
        duree: "30 min",
        objectif: "Préparer l'ouverture : carte, équipe et check-list.",
        docs_in: ["Carte", "Planning équipe"],
        docs_out: ["Check-list ouverture"],
      },
    ],
    raci: {
      roles: ["Gérant", "Chef", "Resp. salle", "Comptable"],
      lots: [
        { name: "Financement", v: ["R", "I", "I", "C"] },
        { name: "Travaux", v: ["A", "C", "I", "I"] },
        { name: "Recrutement", v: ["A", "C", "C", "I"] },
        { name: "Carte", v: ["C", "R", "C", "I"] },
        { name: "Légal / HACCP", v: ["A", "C", "I", "R"] },
        { name: "Ouverture", v: ["A", "R", "R", "I"] },
      ],
    },
  },
};

export const EXAMPLES: ExampleProject[] = [pizzaMaison, pizzeria];
