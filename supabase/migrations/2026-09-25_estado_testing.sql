-- ============================================================================
-- Migración: nuevo estado de proyecto "testing" (entre desarrollo y post go-live)
-- "Beta / enfoque" pasa a llamarse "Prueba de concepto" y "Mantenimiento"
-- pasa a llamarse "Post go-live" solo en la app (los valores internos
-- 'propuesta' y 'mantenimiento' no cambian, no hay que mover datos).
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es idempotente.
-- ============================================================================

begin;

alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in ('descubrimiento', 'propuesta', 'presupuesto', 'desarrollo', 'testing', 'mantenimiento', 'pausado', 'cerrado'));

commit;
