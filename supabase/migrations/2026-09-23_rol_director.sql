-- ============================================================================
-- Migración: nuevo rol "director" (Director de proyecto)
-- Ve y edita TODOS los proyectos, clientes, tareas, archivos y notas, igual
-- que un admin, pero NO puede gestionar el equipo (personas y roles).
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es idempotente.
-- ============================================================================

begin;

-- 1) Permitir el nuevo valor en profiles.role
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'director', 'developer'));

-- 2) is_staff(): admin o director (acceso completo a los datos)
create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'director')
  );
$$;
grant execute on function is_staff() to authenticated;

-- 3) Ser "miembro" de cualquier proyecto también si eres staff
create or replace function is_project_member(pid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from projects p
    where p.id = pid
      and (is_staff() or p.owner_id = auth.uid() or auth.uid() = any(p.developer_ids))
  );
$$;

-- 4) Políticas: donde antes decía is_admin() para datos, ahora is_staff().
--    Las políticas de profiles (gestión del equipo) siguen siendo solo admin.

-- clients
drop policy if exists "clients_write_admin" on clients;
drop policy if exists "clients_update_admin" on clients;
drop policy if exists "clients_delete_admin" on clients;
create policy "clients_write_admin" on clients for insert to authenticated with check (is_staff());
create policy "clients_update_admin" on clients for update to authenticated using (is_staff()) with check (is_staff());
create policy "clients_delete_admin" on clients for delete to authenticated using (is_staff());

-- projects
drop policy if exists "projects_select_member" on projects;
drop policy if exists "projects_insert_admin" on projects;
drop policy if exists "projects_update_admin" on projects;
drop policy if exists "projects_delete_admin" on projects;
create policy "projects_select_member" on projects for select to authenticated
  using (is_staff() or owner_id = auth.uid() or auth.uid() = any(developer_ids));
create policy "projects_insert_admin" on projects for insert to authenticated with check (is_staff());
create policy "projects_update_admin" on projects for update to authenticated using (is_staff()) with check (is_staff());
create policy "projects_delete_admin" on projects for delete to authenticated using (is_staff());

-- tasks
drop policy if exists "tasks_update_member" on tasks;
drop policy if exists "tasks_delete_owner" on tasks;
create policy "tasks_update_member" on tasks for update to authenticated
  using (is_project_member(project_id) and (is_staff() or assignee_id = auth.uid() or created_by = auth.uid()))
  with check (is_project_member(project_id));
create policy "tasks_delete_owner" on tasks for delete to authenticated
  using (is_staff() or created_by = auth.uid());

-- files
drop policy if exists "files_delete_owner" on files;
create policy "files_delete_owner" on files for delete to authenticated
  using (is_staff() or uploaded_by = auth.uid());

-- notes
drop policy if exists "notes_delete_owner" on notes;
create policy "notes_delete_owner" on notes for delete to authenticated
  using (is_staff() or author_id = auth.uid());

-- storage (archivos de proyecto)
drop policy if exists "project_files_delete" on storage.objects;
create policy "project_files_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and (is_staff() or owner = auth.uid()));

commit;

-- Después: en la app, pestaña Equipo, cambia el rol de Francesc a
-- "Director de proyecto".
