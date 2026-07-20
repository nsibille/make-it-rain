-- ============================================================
--  0003 — Seed « Exemples » robuste (atomique, idempotent, sans course)
--  ------------------------------------------------------------
--  Contexte : le seed initial se faisait côté TS depuis un RSC via
--  `insert().select()`. Deux problèmes observés en prod :
--    1) COURSE : deux rendus concurrents du layout créaient DEUX dossiers
--       système « Exemples » (le garde d'idempotence testait juste « un
--       dossier système existe-t-il ? » et les deux passaient avant l'insert).
--    2) ÉCHEC PARTIEL PERMANENT : le dossier était créé mais les projets non
--       (annulation du RSC / `insert().select()` sous RLS), et le garde
--       « dossier existe » bloquait toute reprise → dossiers vides à vie.
--
--  Correctif : tout le seed passe par UNE fonction SECURITY DEFINER,
--  exécutée en une transaction :
--    - verrou consultatif par utilisateur → les appels concurrents se
--      sérialisent (plus de doublons) ;
--    - idempotent : ne fait rien si le dossier contient déjà des projets ;
--    - atomique : un échec annule tout → une reprise repart proprement ;
--    - SECURITY DEFINER : plus de friction RLS / RETURNING sur l'insert.
--  Le contenu (examples.ts) reste la source de vérité, passé en JSONB.
-- ============================================================

-- ── Nettoyage : supprime les dossiers système « Exemples » en double
--    (uniquement les VIDES ; on garde le plus ancien par propriétaire). ──
delete from folders f
where f.is_system
  and not exists (select 1 from projects p where p.folder_id = f.id)
  and exists (
    select 1 from folders g
    where g.is_system
      and g.owner_id = f.owner_id
      and g.id <> f.id
      and (g.created_at < f.created_at
           or (g.created_at = f.created_at and g.id < f.id))
  );

-- ── Garde-fou : au plus UN dossier système par propriétaire. ──
create unique index if not exists folders_one_system_per_owner
  on folders (owner_id)
  where is_system;

-- ── Helper récursif : insère un sous-arbre PBS/WBS/OBS depuis un JSONB
--    [{ name, meta?, children? }]. L'ordre du tableau = la position. ──
create or replace function seed_breakdown_children(
  p_project uuid,
  p_structure structure_kind,
  p_parent uuid,
  p_nodes jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n jsonb;
  i int := 0;
  child uuid;
begin
  if p_nodes is null or jsonb_typeof(p_nodes) <> 'array' then
    return;
  end if;

  for n in select value from jsonb_array_elements(p_nodes) loop
    insert into breakdown_nodes(project_id, structure, parent_id, name, position, meta)
    values (
      p_project, p_structure, p_parent,
      coalesce(n->>'name', ''), i,
      coalesce(n->'meta', '{}'::jsonb)
    )
    returning id into child;

    perform seed_breakdown_children(p_project, p_structure, child, n->'children');
    i := i + 1;
  end loop;
end;
$$;

-- Helper interne : ne pas l'exposer comme endpoint PostgREST.
revoke all on function seed_breakdown_children(uuid, structure_kind, uuid, jsonb)
  from public, anon, authenticated;

-- ── Fonction principale : sème les projets d'exemple pour l'appelant.
--    `payload` = tableau JSON des ExampleProject (cf. src/data/examples.ts),
--    gouvernance déjà mappée (objectifs[] → objectif). Tout est rattaché à
--    auth.uid() : un utilisateur ne peut semer que SON propre espace. ──
create or replace function seed_examples(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid  uuid := auth.uid();
  org  uuid;
  fid  uuid;
  ex   jsonb;
  sp   jsonb;
  gov  jsonb;
  pid  uuid;
  rootid uuid;
  item jsonb;
  idx  int;
begin
  if uid is null then
    return;
  end if;

  -- Sérialise les appels concurrents du même utilisateur.
  perform pg_advisory_xact_lock(hashtext('seed_examples:' || uid::text)::bigint);

  select org_id into org from profiles where id = uid;

  -- Dossier système unique : le retrouver ou le créer.
  select id into fid
  from folders
  where owner_id = uid and is_system
  order by created_at
  limit 1;

  if fid is null then
    insert into folders(owner_id, org_id, name, is_system)
    values (uid, org, 'Exemples', true)
    returning id into fid;
  end if;

  -- Idempotent : déjà semé (le dossier contient des projets) → on sort.
  if exists (select 1 from projects where folder_id = fid) then
    return;
  end if;

  if payload is null or jsonb_typeof(payload) <> 'array' then
    return;
  end if;

  for ex in select value from jsonb_array_elements(payload) loop
    -- Le projet. Le trigger bootstrap_project crée 6-Pack, gouvernance
    -- et les 3 racines PBS/WBS/OBS.
    insert into projects(owner_id, org_id, folder_id, name, emoji, status)
    values (
      uid, org, fid,
      coalesce(ex->>'name', 'Projet'),
      coalesce(ex->>'emoji', '📁'),
      coalesce((ex->>'status')::project_status, 'draft')
    )
    returning id into pid;

    sp := ex->'sixpack';

    -- 6-Pack : prose.
    update sixpacks
    set contexte    = coalesce(sp->>'contexte', ''),
        contraintes = coalesce(sp->>'contraintes', '')
    where project_id = pid;

    -- 6-Pack : listes (l'ordre du tableau = la position).
    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'objectifs', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'objective', item #>> '{}', idx, '{}'::jsonb);
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'livrables', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'deliverable', item #>> '{}', idx, '{}'::jsonb);
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'perimetre'->'in', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'scope_in', item #>> '{}', idx, '{}'::jsonb);
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'perimetre'->'out', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'scope_out', item #>> '{}', idx, '{}'::jsonb);
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'parties_prenantes', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'stakeholder', coalesce(item->>'name', ''), idx,
              jsonb_build_object('role', coalesce(item->>'role', '')));
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select value from jsonb_array_elements(coalesce(sp->'jalons', '[]'::jsonb)) loop
      insert into sixpack_items(project_id, kind, label, position, meta)
      values (pid, 'milestone', coalesce(item->>'label', ''), idx,
              jsonb_build_object('date', coalesce(item->>'date', '')));
      idx := idx + 1;
    end loop;

    -- Arbres : renomme la racine (créée par le trigger) puis insère les enfants.
    select id into rootid from breakdown_nodes
    where project_id = pid and structure = 'pbs' and parent_id is null limit 1;
    if rootid is not null then
      update breakdown_nodes
      set name = coalesce(ex->'pbs'->>'name', name),
          meta = coalesce(ex->'pbs'->'meta', '{}'::jsonb)
      where id = rootid;
      perform seed_breakdown_children(pid, 'pbs', rootid, ex->'pbs'->'children');
    end if;

    select id into rootid from breakdown_nodes
    where project_id = pid and structure = 'wbs' and parent_id is null limit 1;
    if rootid is not null then
      update breakdown_nodes
      set name = coalesce(ex->'wbs'->>'name', name),
          meta = coalesce(ex->'wbs'->'meta', '{}'::jsonb)
      where id = rootid;
      perform seed_breakdown_children(pid, 'wbs', rootid, ex->'wbs'->'children');
    end if;

    select id into rootid from breakdown_nodes
    where project_id = pid and structure = 'obs' and parent_id is null limit 1;
    if rootid is not null then
      update breakdown_nodes
      set name = coalesce(ex->'obs'->>'name', name),
          meta = coalesce(ex->'obs'->'meta', '{}'::jsonb)
      where id = rootid;
      perform seed_breakdown_children(pid, 'obs', rootid, ex->'obs'->'children');
    end if;

    -- Gouvernance (instances déjà mappées côté appelant : objectif unique).
    gov := ex->'governance';
    update governance
    set instances = coalesce(gov->'instances', '[]'::jsonb),
        raci      = coalesce(gov->'raci', '{"roles":[],"lots":[]}'::jsonb)
    where project_id = pid;
  end loop;
end;
$$;

-- Exposé aux utilisateurs authentifiés (chacun sème son propre espace).
revoke all on function seed_examples(jsonb) from public, anon;
grant execute on function seed_examples(jsonb) to authenticated;
