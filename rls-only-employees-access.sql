-- Script para permitir acceso SOLO a la tabla employees
-- Los usuarios autenticados pueden ver/modificar employees
-- NO pueden acceder a: products, sales, customers, repair_orders, suppliers, etc.
-- Ejecuta este script completo en Supabase SQL Editor

-- ============================================
-- 1. EMPLOYEES - PERMITIR ACCESO A TODOS
-- ============================================

-- Eliminar todas las políticas existentes de employees
DROP POLICY IF EXISTS "Authenticated users can view all employees" ON employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view all employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Employees can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Employees can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
DROP POLICY IF EXISTS "Employees can delete employees" ON employees;
DROP POLICY IF EXISTS "Users can view their own employees" ON employees;
DROP POLICY IF EXISTS "Users can insert their own employees" ON employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON employees;

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permitan acceso a usuarios autenticados
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
-- 2. BRANCHES - PERMITIR ACCESO (relacionado con employees)
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view all branches" ON branches;
DROP POLICY IF EXISTS "Admins can view all branches" ON branches;
DROP POLICY IF EXISTS "Employees can view all branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can insert branches" ON branches;
DROP POLICY IF EXISTS "Admins can insert branches" ON branches;
DROP POLICY IF EXISTS "Employees can insert branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can update branches" ON branches;
DROP POLICY IF EXISTS "Admins can update branches" ON branches;
DROP POLICY IF EXISTS "Employees can update branches" ON branches;
DROP POLICY IF EXISTS "Authenticated users can delete branches" ON branches;
DROP POLICY IF EXISTS "Admins can delete branches" ON branches;
DROP POLICY IF EXISTS "Employees can delete branches" ON branches;
DROP POLICY IF EXISTS "Users can view their own branches" ON branches;
DROP POLICY IF EXISTS "Users can insert their own branches" ON branches;
DROP POLICY IF EXISTS "Users can update their own branches" ON branches;
DROP POLICY IF EXISTS "Users can delete their own branches" ON branches;

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
-- 3. PRODUCTS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Solo admin y manager pueden acceder
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
-- 4. SALES - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
DROP POLICY IF EXISTS "Admins can insert sales" ON sales;
DROP POLICY IF EXISTS "Admins can update sales" ON sales;
DROP POLICY IF EXISTS "Admins can delete sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can view all sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON sales;

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
-- 5. CUSTOMERS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can view all customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;

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
-- 6. REPAIR_ORDERS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can insert their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can update their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can delete their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can view all repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can insert repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can update repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can delete repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Authenticated users can view all repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Authenticated users can insert repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Authenticated users can update repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Authenticated users can delete repair orders" ON repair_orders;

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
-- 7. REPAIR_ORDER_PARTS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can insert their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can update their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can delete their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can view all repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can insert repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can update repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can delete repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Authenticated users can view all repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Authenticated users can insert repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Authenticated users can update repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Authenticated users can delete repair order parts" ON repair_order_parts;

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
-- 8. SUPPLIERS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can delete suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON suppliers;

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
-- 9. INVENTORY_MOVEMENTS - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can insert their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can update their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can view all inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can insert inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can update inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can view all inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can insert inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can update inventory movements" ON inventory_movements;

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
-- 10. SERIAL_REGISTRY - BLOQUEAR ACCESO (solo admin/manager)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can insert their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can update their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can delete their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can view all serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can insert serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can update serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can delete serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Authenticated users can view all serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Authenticated users can insert serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Authenticated users can update serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Authenticated users can delete serial registry" ON serial_registry;

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
-- VERIFICACIÓN
-- ============================================

-- Verificar políticas creadas
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN tablename IN ('employees', 'branches') THEN '✓ Acceso permitido a todos'
    ELSE '✗ Solo admin/manager'
  END as acceso
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
--    - employees
--    - branches
--
-- ❌ ACCESO SOLO PARA ADMIN/MANAGER:
--    - products (inventario)
--    - sales (ventas)
--    - customers (clientes)
--    - repair_orders (reparaciones)
--    - repair_order_parts (partes de reparaciones)
--    - suppliers (proveedores)
--    - inventory_movements (movimientos de inventario)
--    - serial_registry (registro de series)
--
-- NOTA: Este script requiere que la función is_current_user_admin() 
--       incluya 'manager' en su verificación. Si no la has ejecutado,
--       ejecuta primero: fix-rls-admin-manager-complete.sql


