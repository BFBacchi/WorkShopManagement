-- Script para permitir acceso a administradores y gerentes
-- Ejecuta este script completo en Supabase SQL Editor
-- Este script actualiza la función is_current_user_admin() para incluir también el rol 'manager'
-- y actualiza todas las políticas RLS para permitir acceso a ambos roles

-- ============================================
-- 1. ACTUALIZAR FUNCIÓN PARA INCLUIR MANAGER
-- ============================================

-- Modificar la función para que también verifique el rol 'manager'
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  current_user_id UUID;
  is_admin_or_manager BOOLEAN;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Si no hay usuario autenticado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el usuario es admin o manager leyendo directamente la tabla
  -- SECURITY DEFINER permite leer sin restricciones RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = current_user_id 
      AND role IN ('admin', 'manager')
      AND status = 'active'
  ) INTO is_admin_or_manager;
  
  RETURN COALESCE(is_admin_or_manager, false);
END;
$$;

-- ============================================
-- 2. ACTUALIZAR POLÍTICAS DE EMPLOYEES
-- ============================================

-- Las políticas de employees ya usan is_current_user_admin(), 
-- así que automáticamente funcionarán con la función actualizada
-- No es necesario recrearlas, pero las verificamos:

-- Verificar políticas de employees
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY policyname;

-- ============================================
-- 3. VERIFICAR QUE LA FUNCIÓN FUNCIONA CORRECTAMENTE
-- ============================================

-- Probar la función (debe retornar true si eres admin o manager)
SELECT is_current_user_admin() as is_admin_or_manager;

-- Verificar tu rol actual
SELECT 
  id,
  email,
  full_name,
  role,
  status
FROM employees 
WHERE id = auth.uid();

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- Todas las políticas RLS que usan is_current_user_admin() ahora
-- permitirán acceso tanto a usuarios con rol 'admin' como 'manager'.
-- 
-- Las tablas afectadas incluyen:
-- - employees
-- - products
-- - sales
-- - customers
-- - repair_orders
-- - suppliers
-- - inventory_movements
-- - serial_registry
-- - repair_order_parts
-- - branches (si usa esta función)
--
-- No es necesario actualizar las políticas individuales porque
-- todas usan la función is_current_user_admin() que ahora incluye ambos roles.


