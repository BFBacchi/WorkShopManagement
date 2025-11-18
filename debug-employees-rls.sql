-- Script de depuración para verificar políticas RLS de employees
-- Ejecuta este script en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar todas las políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY policyname;

-- 2. Verificar si la función existe y funciona
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- 3. Probar la función manualmente (reemplaza el UUID con tu user_id)
-- SELECT is_current_user_admin();

-- 4. Ver todos los empleados sin restricciones RLS (ejecutar como superuser)
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM employees
ORDER BY created_at;

-- 5. Verificar si hay políticas que filtren por user_id
SELECT 
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employees' 
  AND (qual::text LIKE '%user_id%' OR with_check::text LIKE '%user_id%');

