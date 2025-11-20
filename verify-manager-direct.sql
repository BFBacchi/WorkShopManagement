-- Script para verificar directamente en la base de datos (sin depender de auth.uid())
-- Ejecuta este script en Supabase SQL Editor
-- Este script NO requiere estar autenticado

-- ============================================
-- 1. VERIFICAR TODOS LOS USUARIOS GERENTES
-- ============================================

-- Ver todos los usuarios con rol 'manager'
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  branch_id,
  created_at,
  CASE 
    WHEN role = 'manager' AND status = 'active' THEN '✓ Debe tener acceso'
    WHEN role = 'manager' AND status != 'active' THEN '✗ Rol correcto pero status inactivo'
    ELSE '✗ Rol incorrecto'
  END as diagnostico
FROM employees 
WHERE role = 'manager'
ORDER BY created_at DESC;

-- ============================================
-- 2. VERIFICAR TODOS LOS USUARIOS ADMIN
-- ============================================

-- Ver todos los usuarios con rol 'admin'
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  branch_id,
  created_at,
  CASE 
    WHEN role = 'admin' AND status = 'active' THEN '✓ Debe tener acceso'
    WHEN role = 'admin' AND status != 'active' THEN '✗ Rol correcto pero status inactivo'
    ELSE '✗ Rol incorrecto'
  END as diagnostico
FROM employees 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- 3. VERIFICAR LA FUNCIÓN is_current_user_admin()
-- ============================================

-- Ver el código de la función
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- Ver el código fuente de la función (más legible)
SELECT 
  proname as function_name,
  prosrc as function_source_code
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================

-- Ver todas las políticas que usan is_current_user_admin()
SELECT 
  schemaname,
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
-- 5. CONTAR REGISTROS EN CADA TABLA
-- ============================================

-- Esto mostrará el total de registros (sin filtros RLS si ejecutas como superusuario)
SELECT 'products' as tabla, COUNT(*) as total_registros FROM products
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'repair_orders', COUNT(*) FROM repair_orders
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'inventory_movements', COUNT(*) FROM inventory_movements
UNION ALL
SELECT 'serial_registry', COUNT(*) FROM serial_registry
UNION ALL
SELECT 'repair_order_parts', COUNT(*) FROM repair_order_parts
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'branches', COUNT(*) FROM branches
ORDER BY tabla;

-- ============================================
-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================

SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✓ Habilitado'
    ELSE '✗ Deshabilitado'
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
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script para ver todos los usuarios manager
-- 2. Verifica que existe al menos un usuario con:
--    - role = 'manager'
--    - status = 'active'
-- 3. Verifica que la función is_current_user_admin() incluye 'manager' en su código
-- 4. Si el usuario manager no existe o está inactivo, actualízalo:
--    UPDATE employees SET role = 'manager', status = 'active' WHERE email = 'email_del_gerente@ejemplo.com';
-- 5. Si la función no incluye 'manager', ejecuta fix-rls-admin-manager-complete.sql


