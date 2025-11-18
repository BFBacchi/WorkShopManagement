-- Script para configurar políticas RLS de la tabla branches (solo administradores)
-- Ejecuta este script completo en Supabase SQL Editor

-- 1. Verificar si la tabla branches existe
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'branches';

-- 2. Ver políticas RLS existentes para branches
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
WHERE tablename = 'branches';

-- 3. Crear tabla branches si no existe
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS en branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar TODAS las políticas existentes de branches
DROP POLICY IF EXISTS "Authenticated users can view all branches" ON branches;
DROP POLICY IF EXISTS "Admins can view all branches" ON branches;
DROP POLICY IF EXISTS "Employees can view all branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can insert branches" ON branches;
DROP POLICY IF EXISTS "Admins can insert branches" ON branches;
DROP POLICY IF EXISTS "Employees can insert branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can update branches" ON branches;
DROP POLICY IF EXISTS "Admins can update branches" ON branches;
DROP POLICY IF EXISTS "Employees can update branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can delete branches" ON branches;
DROP POLICY IF EXISTS "Admins can delete branches" ON branches;
DROP POLICY IF EXISTS "Employees can delete branches" ON branches;
DROP POLICY IF EXISTS "Users can view their own branches" ON branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON branches;

-- 6. Verificar que la función is_current_user_admin existe (debe existir si ejecutaste fix-employees-rls-v2.sql)
-- Si no existe, créala primero ejecutando fix-employees-rls-v2.sql

-- 7. Crear políticas RLS que solo permitan a administradores ver TODAS las sucursales
CREATE POLICY "Admins can view all branches"
  ON branches FOR SELECT
  USING (is_current_user_admin() = true);

-- 8. Política para insertar sucursales (solo administradores)
CREATE POLICY "Admins can insert branches"
  ON branches FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

-- 9. Política para actualizar sucursales (solo administradores)
CREATE POLICY "Admins can update branches"
  ON branches FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

-- 10. Política para eliminar sucursales (solo administradores)
CREATE POLICY "Admins can delete branches"
  ON branches FOR DELETE
  USING (is_current_user_admin() = true);

-- 11. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

-- 12. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_branches_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW
  EXECUTE FUNCTION update_branches_updated_at();

-- 13. Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'branches'
ORDER BY policyname;

-- NOTA: Este script requiere que la función is_current_user_admin() exista.
-- Si no existe, ejecuta primero fix-employees-rls-v2.sql

