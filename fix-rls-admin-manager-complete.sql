-- Script COMPLETO y ROBUSTO para permitir acceso a administradores y gerentes
-- Ejecuta este script completo en Supabase SQL Editor
-- IMPORTANTE: Ejecuta este script como administrador o con permisos suficientes

-- ============================================
-- PASO 1: ELIMINAR Y RECREAR LA FUNCIÓN
-- ============================================

-- Eliminar la función existente (si existe)
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;

-- Crear la función actualizada que incluye 'admin' y 'manager'
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
-- PASO 2: VERIFICAR QUE LA FUNCIÓN SE CREÓ CORRECTAMENTE
-- ============================================

-- Ver la definición completa de la función
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- Probar la función
SELECT 
  is_current_user_admin() as function_result,
  'Debe ser TRUE si eres admin o manager' as expected;

-- ============================================
-- PASO 3: VERIFICAR TU ROL ACTUAL
-- ============================================

SELECT 
  id,
  email,
  full_name,
  role,
  status,
  CASE 
    WHEN role IN ('admin', 'manager') AND status = 'active' THEN '✓ Debe tener acceso'
    ELSE '✗ NO debe tener acceso'
  END as acceso_esperado
FROM employees 
WHERE id = auth.uid();

-- ============================================
-- PASO 4: PROBAR ACCESO A UNA TABLA DE PRUEBA
-- ============================================

-- Probar acceso a products (debe retornar todos los registros si eres admin/manager)
SELECT 
  COUNT(*) as total_productos,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso funcionando'
    ELSE '✗ Sin acceso - Revisa las políticas RLS'
  END as estado_acceso
FROM products;

-- ============================================
-- PASO 5: VERIFICAR POLÍTICAS RLS
-- ============================================

-- Ver todas las políticas que usan is_current_user_admin()
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%is_current_user_admin%' OR with_check LIKE '%is_current_user_admin%' 
    THEN '✓ Usa la función'
    ELSE '✗ NO usa la función'
  END as usa_funcion
FROM pg_policies 
WHERE tablename IN (
  'products', 
  'sales', 
  'customers', 
  'repair_orders', 
  'suppliers', 
  'inventory_movements', 
  'serial_registry', 
  'repair_order_parts',
  'employees',
  'branches'
)
ORDER BY tablename, cmd;

-- ============================================
-- RESUMEN FINAL
-- ============================================

SELECT 
  'RESUMEN' as seccion,
  auth.uid() as usuario_id,
  (SELECT role FROM employees WHERE id = auth.uid()) as rol,
  (SELECT status FROM employees WHERE id = auth.uid()) as estado,
  is_current_user_admin() as funcion_retorna_true,
  CASE 
    WHEN is_current_user_admin() THEN '✓ TODO CORRECTO - Debes tener acceso'
    ELSE '✗ PROBLEMA - La función no retorna TRUE. Verifica tu rol y estado.'
  END as diagnostico;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Este script actualiza la función is_current_user_admin() para incluir 'manager'
-- 2. Todas las políticas RLS que usan esta función ahora permitirán acceso a admin y manager
-- 3. Si después de ejecutar este script sigues sin acceso:
--    a) Verifica que tu usuario tiene role = 'admin' o 'manager' en la tabla employees
--    b) Verifica que tu usuario tiene status = 'active' en la tabla employees
--    c) Ejecuta el script diagnose-manager-access.sql para más detalles
-- 4. El código de la aplicación también puede estar filtrando por user_id - 
--    eso es un problema separado que requiere cambios en el código TypeScript


