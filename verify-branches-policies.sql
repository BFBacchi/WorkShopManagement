-- Script para verificar políticas RLS de branches
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar todas las políticas de branches
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'branches'
ORDER BY policyname;

-- 2. Verificar si la función is_current_user_admin existe
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- 3. Probar la función (debería retornar true si eres admin)
SELECT is_current_user_admin() as is_admin;

-- 4. Verificar si RLS está habilitado
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'branches';

-- 5. Si la función no existe o retorna false, ejecuta primero fix-employees-rls-v2.sql

