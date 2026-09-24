-- ============================================================================
-- Migración: nuevos estados de proyecto (proceso comercial + ejecución)
--   descubrimiento → propuesta (beta / enfoque) → presupuesto
--   → desarrollo → mantenimiento   ·   además: pausado, cerrado
-- Los proyectos que estaban en "activo" pasan a "desarrollo".
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es idempotente.
-- ============================================================================

begin;

alter table projects drop constraint if exists projects_status_check;

update projects set status = 'desarrollo' where status = 'activo';

alter table projects add constraint projects_status_check
  check (status in ('descubrimiento', 'propuesta', 'presupuesto', 'desarrollo', 'mantenimiento', 'pausado', 'cerrado'));

alter table projects alter column status set default 'descubrimiento';

commit;
