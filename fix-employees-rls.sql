-- Script para verificar y corregir políticas RLS de la tabla employees
-- Ejecuta este script en Supabase SQL Editor

-- 1. Verificar si la tabla employees existe y tiene RLS habilitado
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'employees';

-- 2. Ver políticas RLS existentes para employees
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
WHERE tablename = 'employees';

-- 3. Si la tabla no existe, créala primero
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'technician')),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla branches si no existe
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

-- 5. Habilitar RLS en employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Authenticated users can view all employees" ON employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view all employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Employees can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Employees can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
DROP POLICY IF EXISTS "Employees can delete employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;
DROP POLICY IF EXISTS "Users can insert their own employees" ON employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON employees;

-- 7. Crear función para verificar si el usuario actual es administrador
-- Esta función usa SECURITY DEFINER y SET search_path para poder leer la tabla employees sin restricciones RLS
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  is_admin BOOLEAN;
BEGIN
  user_id := auth.uid();
  
  -- Leer directamente desde la tabla employees sin restricciones RLS
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = user_id AND role = 'admin' AND status = 'active'
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 8. Crear políticas RLS que solo permitan a administradores ver TODOS los empleados
CREATE POLICY "Admins can view all employees"
  ON employees FOR SELECT
  USING (is_current_user_admin());

-- 9. Política para insertar empleados (solo administradores)
CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (is_current_user_admin());

-- 10. Política para actualizar empleados (solo administradores)
CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- 11. Política para eliminar empleados (solo administradores)
CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (is_current_user_admin());

-- 12. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);

-- 13. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at();

-- NOTA IMPORTANTE:
-- Las políticas RLS ahora solo permiten a usuarios con role='admin' y status='active' 
-- en la tabla employees realizar operaciones CRUD sobre empleados.
-- 
-- Para que un usuario pueda ser administrador:
-- 1. Debe existir un registro en la tabla employees con su id (auth.uid())
-- 2. El campo 'role' debe ser 'admin'
-- 3. El campo 'status' debe ser 'active'
--
-- Si eres el primer usuario y necesitas crear tu registro de admin:
-- INSERT INTO employees (id, email, full_name, role, status)
-- VALUES (auth.uid(), 'tu_email@ejemplo.com', 'Tu Nombre', 'admin', 'active');

