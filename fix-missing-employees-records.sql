-- Script para crear registros en employees para usuarios que no tienen uno
-- Ejecuta este script en Supabase SQL Editor
-- Esto asegura que todos los usuarios autenticados tengan un registro en employees

-- ============================================
-- 1. VER USUARIOS SIN REGISTRO EN EMPLOYEES
-- ============================================

SELECT 
  u.id,
  u.email,
  u.created_at,
  '✗ NO tiene registro en employees' as diagnostico
FROM auth.users u
LEFT JOIN employees e ON e.id = u.id
WHERE e.id IS NULL;

-- ============================================
-- 2. CREAR REGISTROS EN EMPLOYEES PARA USUARIOS FALTANTES
-- ============================================

-- Insertar usuarios que no tienen registro en employees
INSERT INTO employees (id, email, full_name, role, status)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuario') as full_name,
  COALESCE(u.raw_user_meta_data->>'role', 'employee')::text as role,
  'active' as status
FROM auth.users u
LEFT JOIN employees e ON e.id = u.id
WHERE e.id IS NULL;

-- ============================================
-- 3. VERIFICAR QUE TODOS LOS USUARIOS TIENEN REGISTRO
-- ============================================

SELECT 
  u.id,
  u.email,
  e.id as employee_id,
  e.role,
  e.status,
  CASE 
    WHEN e.id IS NOT NULL THEN '✓ Tiene registro'
    ELSE '✗ AÚN sin registro'
  END as estado
FROM auth.users u
LEFT JOIN employees e ON e.id = u.id
ORDER BY u.created_at;

-- ============================================
-- NOTAS:
-- ============================================
-- Este script crea registros en employees para usuarios que no tienen uno.
-- Los usuarios se crean con:
-- - role: 'employee' (por defecto) o el rol de metadata si existe
-- - status: 'active'
-- - full_name: del metadata o email si no existe
--
-- Después de ejecutar este script, todos los usuarios deberían poder acceder
-- a las tablas según las políticas RLS configuradas.

