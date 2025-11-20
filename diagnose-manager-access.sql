-- Script de diagnóstico completo para el problema del gerente
-- Ejecuta este script completo en Supabase SQL Editor
-- Ejecuta este script INICIANDO SESIÓN COMO EL USUARIO GERENTE

-- ============================================
-- 1. VERIFICAR TU USUARIO ACTUAL
-- ============================================

-- Ver tu ID de usuario autenticado
SELECT auth.uid() as current_user_id;

-- Ver tu registro en employees
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  branch_id,
  created_at
FROM employees 
WHERE id = auth.uid();

-- ============================================
-- 2. VERIFICAR LA FUNCIÓN is_current_user_admin()
-- ============================================

-- Ver el código completo de la función
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- Probar la función (debe retornar TRUE si eres admin o manager)
SELECT 
  is_current_user_admin() as function_result,
  'Debe ser TRUE si eres admin o manager' as expected;

-- ============================================
-- 3. VERIFICAR MANUALMENTE SI ERES ADMIN O MANAGER
-- ============================================

-- Verificar directamente en la tabla
SELECT 
  EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND status = 'active'
  ) as is_admin_or_manager_direct_check;

-- ============================================
-- 4. PROBAR ACCESO A CADA TABLA
-- ============================================

-- Probar acceso a products
SELECT 
  'products' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM products;

-- Probar acceso a sales
SELECT 
  'sales' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM sales;

-- Probar acceso a customers
SELECT 
  'customers' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM customers;

-- Probar acceso a repair_orders
SELECT 
  'repair_orders' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM repair_orders;

-- Probar acceso a suppliers
SELECT 
  'suppliers' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM suppliers;

-- Probar acceso a inventory_movements
SELECT 
  'inventory_movements' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM inventory_movements;

-- Probar acceso a serial_registry
SELECT 
  'serial_registry' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM serial_registry;

-- Probar acceso a repair_order_parts
SELECT 
  'repair_order_parts' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM repair_order_parts;

-- Probar acceso a employees
SELECT 
  'employees' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM employees;

-- Probar acceso a branches
SELECT 
  'branches' as tabla,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ Acceso permitido'
    ELSE '✗ Sin acceso (RLS bloqueando)'
  END as estado
FROM branches;

-- ============================================
-- 5. VERIFICAR POLÍTICAS RLS DE CADA TABLA
-- ============================================

-- Ver todas las políticas que deberían permitir acceso
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
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
AND (
  qual LIKE '%is_current_user_admin%' 
  OR with_check LIKE '%is_current_user_admin%'
)
ORDER BY tablename, cmd;

-- ============================================
-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================

SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✓ Habilitado'
    ELSE '✗ Deshabilitado (PROBLEMA)'
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
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
ORDER BY tablename;

-- ============================================
-- RESUMEN Y DIAGNÓSTICO
-- ============================================

-- Resumen final
SELECT 
  'DIAGNÓSTICO COMPLETO' as seccion,
  auth.uid() as usuario_id,
  (SELECT role FROM employees WHERE id = auth.uid()) as rol_actual,
  (SELECT status FROM employees WHERE id = auth.uid()) as estado_actual,
  is_current_user_admin() as funcion_retorna_true,
  CASE 
    WHEN is_current_user_admin() THEN '✓ Función OK'
    ELSE '✗ Función NO retorna TRUE - PROBLEMA'
  END as diagnostico_funcion;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script INICIANDO SESIÓN COMO EL USUARIO GERENTE
-- 2. Revisa los resultados:
--    - Si "function_result" es FALSE, la función no está funcionando correctamente
--    - Si "total_registros" es 0 en todas las tablas, las políticas RLS están bloqueando
--    - Si "rls_enabled" es false en alguna tabla, RLS no está habilitado
-- 3. Copia los resultados y compártelos para diagnóstico adicional


