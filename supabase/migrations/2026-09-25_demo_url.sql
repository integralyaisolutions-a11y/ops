-- ============================================================================
-- Migración: enlace a la demo de cada proyecto (prueba de concepto, beta…)
-- Ejecutar una sola vez en el SQL Editor de Supabase. Es idempotente.
-- ============================================================================

alter table projects add column if not exists demo_url text default '';
