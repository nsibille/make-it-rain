-- ============================================================
--  Durcissement des fonctions (advisors sécurité).
--  Ne change ni le schéma ni la RLS : retire seulement l'exposition
--  RPC publique des fonctions et fixe un search_path explicite.
-- ============================================================

-- 1) search_path explicite (function_search_path_mutable)
alter function public.touch_updated_at() set search_path = public;

-- 2) Fonctions trigger : plus d'exécution publique (RPC).
--    Les triggers s'exécutent indépendamment du privilège EXECUTE
--    de l'appelant, donc c'est sans effet sur leur fonctionnement.
revoke execute on function public.bootstrap_project() from public;
revoke execute on function public.handle_new_user()  from public;
revoke execute on function public.touch_updated_at() from public;

-- 3) Helpers RLS : retirer l'accès public (anon) MAIS conserver
--    l'exécution pour authenticated — indispensable à l'évaluation
--    des policies (using (can_read_project(id)) / project_role_of()).
revoke execute on function public.project_role_of(uuid)  from public;
revoke execute on function public.can_read_project(uuid) from public;
grant  execute on function public.project_role_of(uuid)  to authenticated;
grant  execute on function public.can_read_project(uuid) to authenticated;
