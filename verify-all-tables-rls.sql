-- Script para verificar las políticas RLS de todas las tablas
-- Ejecuta este script después de fix-all-tables-rls.sql

-- 1. Verificar que la función is_current_user_admin existe
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- 2. Probar la función (debe retornar true si eres admin)
SELECT is_current_user_admin() as is_admin;

-- 3. Verificar todas las políticas RLS de las tablas principales
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
ORDER BY tablename, cmd, policyname;

-- 4. Verificar que RLS está habilitado en todas las tablas
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

-- 5. Contar registros en cada tabla (solo deberías ver registros si eres admin)
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

-- 6. Verificar tu registro de empleado
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM employees
WHERE id = auth.uid();

-- NOTA: Si is_current_user_admin() retorna false pero deberías ser admin,
-- verifica que:
-- 1. Existe un registro en employees con tu id (auth.uid())
-- 2. El campo 'role' es 'admin'
-- 3. El campo 'status' es 'active'

