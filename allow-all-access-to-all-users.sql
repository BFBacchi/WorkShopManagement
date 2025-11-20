-- Script para permitir acceso COMPLETO a TODAS las tablas para CUALQUIER usuario autenticado
-- Ejecuta este script completo en Supabase SQL Editor
-- ⚠️ ADVERTENCIA: Esto permite que cualquier usuario autenticado vea/modifique/elimine TODA la información

-- ============================================
-- PASO 1: PRODUCTS - PERMITIR ACCESO A TODOS
-- ============================================

-- Eliminar todas las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON products';
    END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- PASO 2: SALES - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sales') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON sales';
    END LOOP;
END $$;

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 3: CUSTOMERS - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'customers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON customers';
    END LOOP;
END $$;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 4: REPAIR_ORDERS - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'repair_orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON repair_orders';
    END LOOP;
END $$;

ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all repair orders"
  ON repair_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert repair orders"
  ON repair_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update repair orders"
  ON repair_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete repair orders"
  ON repair_orders FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 5: REPAIR_ORDER_PARTS - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'repair_order_parts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON repair_order_parts';
    END LOOP;
END $$;

ALTER TABLE repair_order_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all repair order parts"
  ON repair_order_parts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert repair order parts"
  ON repair_order_parts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update repair order parts"
  ON repair_order_parts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete repair order parts"
  ON repair_order_parts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 6: SUPPLIERS - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'suppliers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON suppliers';
    END LOOP;
END $$;

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 7: INVENTORY_MOVEMENTS - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'inventory_movements') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON inventory_movements';
    END LOOP;
END $$;

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all inventory movements"
  ON inventory_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inventory movements"
  ON inventory_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory movements"
  ON inventory_movements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete inventory movements"
  ON inventory_movements FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 8: SERIAL_REGISTRY - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'serial_registry') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON serial_registry';
    END LOOP;
END $$;

ALTER TABLE serial_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all serial registry"
  ON serial_registry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert serial registry"
  ON serial_registry FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update serial registry"
  ON serial_registry FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete serial registry"
  ON serial_registry FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 9: EMPLOYEES - Ya está configurado, pero lo mantenemos
-- ============================================

-- Employees ya tiene políticas para todos los usuarios autenticados
-- No es necesario cambiarlo, pero verificamos que esté correcto

-- ============================================
-- PASO 10: BRANCHES - Ya está configurado, pero lo mantenemos
-- ============================================

-- Branches ya tiene políticas para todos los usuarios autenticados
-- No es necesario cambiarlo, pero verificamos que esté correcto

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver resumen de políticas creadas
SELECT 
  tablename,
  COUNT(*) as total_politicas,
  '✓ Acceso para todos los usuarios autenticados' as tipo_acceso
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

-- Ver políticas detalladas
SELECT 
  tablename,
  policyname,
  cmd
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
-- RESUMEN
-- ============================================
-- ✅ TODAS LAS TABLAS AHORA PERMITEN ACCESO A TODOS LOS USUARIOS AUTENTICADOS:
--    - products (4 políticas)
--    - sales (4 políticas)
--    - customers (4 políticas)
--    - repair_orders (4 políticas)
--    - repair_order_parts (4 políticas)
--    - suppliers (4 políticas)
--    - inventory_movements (4 políticas - ahora incluye DELETE)
--    - serial_registry (4 políticas)
--    - employees (4 políticas)
--    - branches (4 políticas)
--
-- ⚠️ ADVERTENCIA: Cualquier usuario autenticado puede ahora:
--    - Ver TODOS los datos
--    - Modificar TODOS los datos
--    - Eliminar TODOS los datos
--
-- Esto es adecuado para desarrollo/testing, pero NO recomendado para producción.

