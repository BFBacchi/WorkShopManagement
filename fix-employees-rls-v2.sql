-- Script CORREGIDO para políticas RLS de employees (solo administradores)
-- Ejecuta este script completo en Supabase SQL Editor

-- 1. Eliminar función existente si existe
DROP FUNCTION IF EXISTS is_current_user_admin();

-- 2. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view all employees" ON employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view all employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Employees can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Employees can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
DROP POLICY IF EXISTS "Employees can delete employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;
DROP POLICY IF EXISTS "Users can insert their own employees" ON employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON employees;

-- 3. Crear función mejorada para verificar si el usuario actual es administrador
-- Esta función lee directamente desde la tabla sin restricciones RLS
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  current_user_id UUID;
  admin_check BOOLEAN;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Si no hay usuario autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el usuario es admin leyendo directamente la tabla
  -- SECURITY DEFINER permite leer sin restricciones RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = current_user_id 
      AND role = 'admin' 
      AND status = 'active'
  ) INTO admin_check;
  
  RETURN COALESCE(admin_check, false);
END;
$$;

-- 4. Crear políticas RLS que solo permitan a administradores ver TODOS los empleados
CREATE POLICY "Admins can view all employees"
  ON employees FOR SELECT
  USING (is_current_user_admin() = true);

-- 5. Política para insertar empleados (solo administradores)
CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

-- 6. Política para actualizar empleados (solo administradores)
CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

-- 7. Política para eliminar empleados (solo administradores)
CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (is_current_user_admin() = true);

-- 8. Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY policyname;

-- NOTA: Si después de ejecutar este script sigues viendo solo tu registro,
-- ejecuta el script debug-employees-rls.sql para diagnosticar el problema.

