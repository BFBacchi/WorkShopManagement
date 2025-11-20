-- Script COMPLETO para aplicar restricciones: solo acceso a employees y branches
-- Ejecuta este script completo en Supabase SQL Editor
-- Este script primero verifica/actualiza la función is_current_user_admin()
-- y luego aplica las restricciones de acceso

-- ============================================
-- PASO 0: Asegurar que la función is_current_user_admin() incluye 'manager'
-- ============================================

-- Verificar si la función existe y actualizarla si es necesario
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
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
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
-- PASO 1: EMPLOYEES - PERMITIR ACCESO A TODOS
-- ============================================

-- Eliminar TODAS las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'employees') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON employees';
    END LOOP;
END $$;

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 2: BRANCHES - PERMITIR ACCESO A TODOS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'branches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON branches';
    END LOOP;
END $$;

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all branches"
  ON branches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert branches"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update branches"
  ON branches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete branches"
  ON branches FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 3: PRODUCTS - SOLO ADMIN/MANAGER
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON products';
    END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view all products"
  ON products FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert products"
  ON products FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update products"
  ON products FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete products"
  ON products FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 4: CUSTOMERS - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all customers"
  ON customers FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert customers"
  ON customers FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update customers"
  ON customers FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete customers"
  ON customers FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 5: REPAIR_ORDERS - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all repair orders"
  ON repair_orders FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert repair orders"
  ON repair_orders FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update repair orders"
  ON repair_orders FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete repair orders"
  ON repair_orders FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 6: REPAIR_ORDER_PARTS - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all repair order parts"
  ON repair_order_parts FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert repair order parts"
  ON repair_order_parts FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update repair order parts"
  ON repair_order_parts FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete repair order parts"
  ON repair_order_parts FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 7: SALES - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all sales"
  ON sales FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert sales"
  ON sales FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update sales"
  ON sales FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete sales"
  ON sales FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 8: SUPPLIERS - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all suppliers"
  ON suppliers FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update suppliers"
  ON suppliers FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete suppliers"
  ON suppliers FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- PASO 9: INVENTORY_MOVEMENTS - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all inventory movements"
  ON inventory_movements FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert inventory movements"
  ON inventory_movements FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update inventory movements"
  ON inventory_movements FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

-- ============================================
-- PASO 10: SERIAL_REGISTRY - SOLO ADMIN/MANAGER
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

CREATE POLICY "Admins and managers can view all serial registry"
  ON serial_registry FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can insert serial registry"
  ON serial_registry FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can update serial registry"
  ON serial_registry FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins and managers can delete serial registry"
  ON serial_registry FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver resumen de políticas creadas
SELECT 
  tablename,
  COUNT(*) as total_politicas,
  CASE 
    WHEN tablename IN ('employees', 'branches') THEN '✓ Acceso para todos'
    ELSE '✗ Solo admin/manager'
  END as tipo_acceso
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
-- ✅ ACCESO PERMITIDO A TODOS LOS USUARIOS AUTENTICADOS:
--    - employees (4 políticas)
--    - branches (4 políticas)
--
-- ❌ ACCESO SOLO PARA ADMIN/MANAGER:
--    - products (4 políticas)
--    - sales (4 políticas)
--    - customers (4 políticas)
--    - repair_orders (4 políticas)
--    - repair_order_parts (4 políticas)
--    - suppliers (4 políticas)
--    - inventory_movements (3 políticas)
--    - serial_registry (4 políticas)

