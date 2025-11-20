-- Script de diagnóstico para verificar por qué los usuarios no pueden acceder
-- Ejecuta este script en Supabase SQL Editor

-- ============================================
-- 1. VERIFICAR USUARIOS EN AUTH.USERS
-- ============================================

-- Ver todos los usuarios autenticados
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN last_sign_in_at IS NULL THEN '✗ Nunca ha iniciado sesión'
    WHEN last_sign_in_at > NOW() - INTERVAL '1 day' THEN '✓ Activo recientemente'
    ELSE '⚠️ Inactivo'
  END as estado_sesion
FROM auth.users
ORDER BY created_at;

-- ============================================
-- 2. VERIFICAR USUARIOS EN EMPLOYEES
-- ============================================

-- Ver todos los usuarios en la tabla employees
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  branch_id,
  CASE 
    WHEN role IN ('admin', 'manager') AND status = 'active' THEN '✓ Admin/Manager activo'
    WHEN status = 'active' THEN '✓ Usuario activo'
    ELSE '✗ Usuario inactivo o sin rol'
  END as diagnostico
FROM employees
ORDER BY created_at;

-- ============================================
-- 3. VERIFICAR QUE LOS IDs COINCIDEN
-- ============================================

-- Verificar que los usuarios de auth.users tienen registros en employees
SELECT 
  u.id as auth_id,
  u.email as auth_email,
  u.last_sign_in_at,
  e.id as employee_id,
  e.email as employee_email,
  e.role,
  e.status,
  CASE 
    WHEN e.id IS NULL THEN '✗ NO tiene registro en employees'
    WHEN e.id = u.id THEN '✓ IDs coinciden'
    ELSE '⚠️ IDs NO coinciden'
  END as diagnostico
FROM auth.users u
LEFT JOIN employees e ON e.id = u.id
ORDER BY u.created_at;

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS ACTUALES
-- ============================================

-- Ver las políticas actuales y sus condiciones
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check,
  roles
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
-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================

SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✓ RLS habilitado'
    ELSE '✗ RLS deshabilitado'
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
-- 6. CONTAR REGISTROS (sin filtros RLS - como superusuario)
-- ============================================

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
-- 7. VERIFICAR SI HAY POLÍTICAS CONFLICTIVAS
-- ============================================

-- Ver si hay múltiples políticas para la misma operación
SELECT 
  tablename,
  cmd,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as nombres_politicas
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
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- ============================================
-- RESUMEN Y RECOMENDACIONES
-- ============================================

SELECT 
  'DIAGNÓSTICO' as seccion,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM employees) as total_usuarios_employees,
  (SELECT COUNT(*) FROM employees WHERE status = 'active') as usuarios_activos,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN employees e ON e.id = u.id WHERE e.id IS NULL) as usuarios_sin_registro_employees;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Revisa la sección 3 para ver si los usuarios tienen registros en employees
-- 2. Si un usuario NO tiene registro en employees, créalo:
--    INSERT INTO employees (id, email, full_name, role, status)
--    VALUES ('ID_DEL_USUARIO', 'email@ejemplo.com', 'Nombre', 'employee', 'active');
-- 3. Verifica que las políticas en la sección 4 dicen "TO authenticated"
-- 4. Si hay políticas conflictivas en la sección 7, elimínalas

