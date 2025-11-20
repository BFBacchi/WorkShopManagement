-- Script para DESHABILITAR RLS en todas las tablas
-- ⚠️ ADVERTENCIA: Esto permite que CUALQUIER usuario autenticado vea TODA la información
-- Ejecuta este script completo en Supabase SQL Editor
-- IMPORTANTE: Solo para desarrollo/testing. NO usar en producción sin considerar seguridad.

-- ============================================
-- OPCIÓN 1: DESHABILITAR RLS COMPLETAMENTE
-- ============================================

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE repair_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE serial_registry DISABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPCIÓN 2: ELIMINAR TODAS LAS POLÍTICAS RLS (alternativa)
-- ============================================

-- Si prefieres mantener RLS habilitado pero sin restricciones,
-- descomenta estas líneas y comenta la sección OPCIÓN 1:

/*
-- Eliminar todas las políticas de products
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Crear políticas que permitan acceso a todos los usuarios autenticados
CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Repetir para otras tablas...
*/

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que RLS está deshabilitado
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✗ AÚN HABILITADO'
    ELSE '✓ DESHABILITADO'
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

-- Verificar que no hay políticas activas
SELECT 
  tablename,
  COUNT(*) as total_politicas
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
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Con RLS deshabilitado, CUALQUIER usuario autenticado puede:
--    - Ver TODOS los datos
--    - Modificar TODOS los datos
--    - Eliminar TODOS los datos
--
-- 2. Esto es PELIGROSO en producción. Solo usar para desarrollo/testing.
--
-- 3. Si necesitas restablecer RLS después:
--    - Ejecuta: ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;
--    - Luego crea las políticas apropiadas
--
-- 4. Alternativa más segura: Usar la OPCIÓN 2 comentada arriba
--    que mantiene RLS pero permite acceso a usuarios autenticados


