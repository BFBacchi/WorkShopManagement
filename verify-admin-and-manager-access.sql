-- Script para verificar que administradores y gerentes pueden acceder a los datos
-- Ejecuta este script después de fix-rls-for-admin-and-manager.sql

-- ============================================
-- 1. VERIFICAR LA FUNCIÓN ACTUALIZADA
-- ============================================

-- Ver el código de la función
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- Probar la función (debe retornar true si eres admin o manager)
SELECT is_current_user_admin() as is_admin_or_manager;

-- ============================================
-- 2. VERIFICAR TU ROL ACTUAL
-- ============================================

-- Ver tu registro de empleado
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  branch_id
FROM employees 
WHERE id = auth.uid();

-- ============================================
-- 3. VERIFICAR ACCESO A LAS TABLAS PRINCIPALES
-- ============================================

-- Contar registros en cada tabla (deberías poder ver todos si eres admin o manager)
SELECT 'products' as tabla, COUNT(*) as total FROM products
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
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================

SELECT 
  tablename, 
  rowsecurity as rls_enabled
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
-- RESULTADOS ESPERADOS:
-- ============================================
-- 1. La función is_current_user_admin() debe verificar role IN ('admin', 'manager')
-- 2. is_current_user_admin() debe retornar true si tu rol es 'admin' o 'manager'
-- 3. Debes poder ver todos los registros en todas las tablas si eres admin o manager
-- 4. Todas las políticas deben usar is_current_user_admin()
-- 5. RLS debe estar habilitado en todas las tablas
--
-- Si alguno de estos puntos falla, revisa:
-- - Que ejecutaste fix-rls-for-admin-and-manager.sql correctamente
-- - Que tu usuario tiene role = 'admin' o 'manager' en la tabla employees
-- - Que tu usuario tiene status = 'active' en la tabla employees


