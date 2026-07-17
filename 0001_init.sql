-- ============================================================
--  Cadrage Studio — migration initiale
--  Postgres / Supabase. À appliquer une fois sur un projet vierge.
--  Appliquer de préférence via le MCP Supabase (apply_migration).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────
create type project_status as enum ('draft', 'published', 'shared');
create type project_role   as enum ('pmo', 'annotator', 'observer');
create type structure_kind as enum ('pbs', 'wbs', 'obs');
create type sixpack_kind    as enum ('objective', 'deliverable', 'scope_in', 'scope_out', 'stakeholder', 'milestone');

-- ── Identité ────────────────────────────────────────────────
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  org_id      uuid references organizations(id),
  created_at  timestamptz default now()
);

-- ── Filesystem (dossiers imbriquables) ──────────────────────
create table folders (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  org_id      uuid references organizations(id),
  parent_id   uuid references folders(id) on delete cascade,
  name        text not null,
  is_system   boolean default false,          -- dossier "Exemples"
  position    int default 0,
  created_at  timestamptz default now()
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  org_id      uuid references organizations(id),
  folder_id   uuid references folders(id) on delete set null,
  name        text not null,
  emoji       text default '📁',
  status      project_status not null default 'draft',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Partage : le propriétaire est pmo implicite ; les invités sont ici.
create table project_members (
  project_id  uuid references projects(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  role        project_role not null default 'observer',
  invited_at  timestamptz default now(),
  primary key (project_id, user_id)
);

-- ── 6-Pack (input) ──────────────────────────────────────────
create table sixpacks (
  project_id  uuid primary key references projects(id) on delete cascade,
  contexte    text default '',      -- cadre / intro (optionnel)
  contraintes text default ''       -- contraintes libres
);

-- Listes du 6-Pack. kinds :
--   objective, deliverable  → texte simple
--   scope_in / scope_out    → périmètre IN / OUT (ce qui est / n'est pas dans le projet)
--   stakeholder             → meta {"role": "..."}
--   milestone               → meta {"date": "..."}
create table sixpack_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  kind        sixpack_kind not null,
  position    int not null default 0,
  label       text not null,
  meta        jsonb default '{}'::jsonb
);
create index on sixpack_items (project_id, kind, position);

-- ── Arborescences PBS / WBS / OBS (output) ──────────────────
-- Une seule table auto-référente, discriminée par `structure`.
-- La racine a parent_id NULL. Les codes (1.0, 1.0.1, 1.0.1.1 …) sont
-- calculés côté client à partir de la position — jamais stockés.
create table breakdown_nodes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  structure   structure_kind not null,
  parent_id   uuid references breakdown_nodes(id) on delete cascade,
  position    int not null default 0,
  name        text not null,
  -- meta par nœud (souple, sans changement de schéma) :
  --   OBS  → {"responsabilites": "...", "acteur": "...", "effectif": 1}
  --   WBS  → {"categorie": "...", "avancement": 0, "criticite": "med"} (usage futur)
  --   N5   → {"free": true} pour les notes libres sous une boîte N4
  meta        jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);
create index on breakdown_nodes (project_id, structure, parent_id, position);

-- ── Gouvernance (jsonb : peu édité, structure souple) ───────
-- instances : une entrée par réunion / instance de décision. Chaque entrée :
--   {
--     name,               -- ex. "Comité de pilotage"
--     animateur,          -- qui anime
--     scribe,             -- qui prend les notes
--     acteurs: [],        -- participants
--     frequence,          -- ex. "Mensuel"
--     duree,              -- ex. "60 min"
--     objectif,           -- but de la réunion
--     docs_in:  [],       -- documents en entrée
--     docs_out: []        -- documents produits en sortie
--   }
create table governance (
  project_id  uuid primary key references projects(id) on delete cascade,
  instances   jsonb default '[]'::jsonb,
  raci        jsonb default '{"roles":[],"lots":[]}'::jsonb -- {roles:[], lots:[{name,v:[]}]}
);

-- ── Annotations (temps réel) ────────────────────────────────
create table annotations (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  node_id     uuid not null references breakdown_nodes(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);
create index on annotations (node_id);

-- ============================================================
--  Fonctions d'aide (SECURITY DEFINER — utilisées par la RLS)
-- ============================================================
create or replace function project_role_of(p uuid)
returns project_role language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from projects where id = p and owner_id = auth.uid())
      then 'pmo'::project_role
    else (select role from project_members where project_id = p and user_id = auth.uid())
  end;
$$;

create or replace function can_read_project(p uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from projects pr
    where pr.id = p and (
      pr.owner_id = auth.uid()
      or exists (select 1 from project_members m where m.project_id = p and m.user_id = auth.uid())
      or (pr.status = 'published' and pr.org_id = (select org_id from profiles where id = auth.uid()))
    )
  );
$$;

-- ============================================================
--  Automatismes
-- ============================================================
-- À la création d'un projet : crée le 6-Pack, la gouvernance
-- et les trois racines PBS / WBS / OBS.
create or replace function bootstrap_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into sixpacks(project_id)   values (new.id);
  insert into governance(project_id) values (new.id);
  insert into breakdown_nodes(project_id, structure, name) values
    (new.id, 'pbs', new.name),
    (new.id, 'wbs', new.name),
    (new.id, 'obs', 'Organisation');
  return new;
end $$;
create trigger trg_bootstrap after insert on projects
  for each row execute function bootstrap_project();

-- updated_at automatique
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_touch before update on projects
  for each row execute function touch_updated_at();

-- Profil auto à l'inscription
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger trg_new_user after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
--  RLS
-- ============================================================
alter table organizations   enable row level security;
alter table profiles        enable row level security;
alter table folders         enable row level security;
alter table projects        enable row level security;
alter table project_members enable row level security;
alter table sixpacks        enable row level security;
alter table sixpack_items   enable row level security;
alter table breakdown_nodes enable row level security;
alter table governance      enable row level security;
alter table annotations     enable row level security;

-- profiles : lire soi + même org ; modifier soi
create policy "profiles read"   on profiles for select using (
  id = auth.uid() or org_id = (select org_id from profiles where id = auth.uid()));
create policy "profiles update" on profiles for update using (id = auth.uid());

-- organizations : lire si membre
create policy "orgs read"   on organizations for select using (
  id = (select org_id from profiles where id = auth.uid()));
create policy "orgs insert" on organizations for insert with check (auth.uid() is not null);

-- folders : propriétaire = tous droits ; lecture des dossiers système
create policy "folders own"    on folders for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "folders system" on folders for select using (is_system = true);

-- projects
create policy "projects read"   on projects for select using (can_read_project(id));
create policy "projects insert" on projects for insert with check (owner_id = auth.uid());
create policy "projects update" on projects for update using (project_role_of(id) = 'pmo');
create policy "projects delete" on projects for delete using (owner_id = auth.uid());

-- project_members : lecture si accès projet ; écriture par le pmo
create policy "members read"  on project_members for select using (can_read_project(project_id));
create policy "members write" on project_members for all
  using (project_role_of(project_id) = 'pmo')
  with check (project_role_of(project_id) = 'pmo');

-- sixpacks + items : lecture si accès ; écriture pmo
create policy "sixpack read"  on sixpacks for select using (can_read_project(project_id));
create policy "sixpack write" on sixpacks for all
  using (project_role_of(project_id) = 'pmo') with check (project_role_of(project_id) = 'pmo');
create policy "sixitems read"  on sixpack_items for select using (can_read_project(project_id));
create policy "sixitems write" on sixpack_items for all
  using (project_role_of(project_id) = 'pmo') with check (project_role_of(project_id) = 'pmo');

-- breakdown_nodes : lecture si accès ; écriture pmo
create policy "nodes read"  on breakdown_nodes for select using (can_read_project(project_id));
create policy "nodes write" on breakdown_nodes for all
  using (project_role_of(project_id) = 'pmo') with check (project_role_of(project_id) = 'pmo');

-- governance : lecture si accès ; écriture pmo
create policy "gov read"  on governance for select using (can_read_project(project_id));
create policy "gov write" on governance for all
  using (project_role_of(project_id) = 'pmo') with check (project_role_of(project_id) = 'pmo');

-- annotations :
--   lecture si accès projet
--   création si pmo OU annotator (et author = soi)
--   édition/suppression par l'auteur ou le pmo
create policy "annot read"   on annotations for select using (can_read_project(project_id));
create policy "annot insert" on annotations for insert with check (
  author_id = auth.uid() and project_role_of(project_id) in ('pmo', 'annotator'));
create policy "annot update" on annotations for update using (
  author_id = auth.uid() or project_role_of(project_id) = 'pmo');
create policy "annot delete" on annotations for delete using (
  author_id = auth.uid() or project_role_of(project_id) = 'pmo');

-- ── Realtime ────────────────────────────────────────────────
alter publication supabase_realtime add table annotations;
alter publication supabase_realtime add table breakdown_nodes;
