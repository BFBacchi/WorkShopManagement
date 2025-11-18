-- Script para configurar políticas RLS de todas las tablas (solo administradores)
-- Ejecuta este script completo en Supabase SQL Editor
-- IMPORTANTE: Este script requiere que la función is_current_user_admin() exista
-- Si no existe, ejecuta primero fix-employees-rls-v2.sql

-- ============================================
-- 1. PRODUCTS
-- ============================================

-- Eliminar políticas existentes de products
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 2. SALES
-- ============================================

-- Eliminar políticas existentes de sales
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
DROP POLICY IF EXISTS "Admins can insert sales" ON sales;
DROP POLICY IF EXISTS "Admins can update sales" ON sales;
DROP POLICY IF EXISTS "Admins can delete sales" ON sales;

-- Habilitar RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all sales"
  ON sales FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert sales"
  ON sales FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update sales"
  ON sales FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete sales"
  ON sales FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 3. CUSTOMERS
-- ============================================

-- Eliminar políticas existentes de customers
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 4. REPAIR_ORDERS
-- ============================================

-- Eliminar políticas existentes de repair_orders
DROP POLICY IF EXISTS "Users can view their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can insert their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can update their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Users can delete their own repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can view all repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can insert repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can update repair orders" ON repair_orders;
DROP POLICY IF EXISTS "Admins can delete repair orders" ON repair_orders;

-- Habilitar RLS
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all repair orders"
  ON repair_orders FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert repair orders"
  ON repair_orders FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update repair orders"
  ON repair_orders FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete repair orders"
  ON repair_orders FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 5. SUPPLIERS
-- ============================================

-- Eliminar políticas existentes de suppliers
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can delete suppliers" ON suppliers;

-- Habilitar RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all suppliers"
  ON suppliers FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update suppliers"
  ON suppliers FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete suppliers"
  ON suppliers FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 6. INVENTORY_MOVEMENTS
-- ============================================

-- Eliminar políticas existentes de inventory_movements
DROP POLICY IF EXISTS "Users can view their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can insert their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can update their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can view all inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can insert inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Admins can update inventory movements" ON inventory_movements;

-- Habilitar RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all inventory movements"
  ON inventory_movements FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert inventory movements"
  ON inventory_movements FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update inventory movements"
  ON inventory_movements FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

-- ============================================
-- 7. SERIAL_REGISTRY
-- ============================================

-- Eliminar políticas existentes de serial_registry
DROP POLICY IF EXISTS "Users can view their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can insert their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can update their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can delete their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can view all serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can insert serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can update serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Admins can delete serial registry" ON serial_registry;

-- Habilitar RLS
ALTER TABLE serial_registry ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all serial registry"
  ON serial_registry FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert serial registry"
  ON serial_registry FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update serial registry"
  ON serial_registry FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete serial registry"
  ON serial_registry FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- 8. REPAIR_ORDER_PARTS
-- ============================================

-- Eliminar políticas existentes de repair_order_parts
DROP POLICY IF EXISTS "Users can view their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can insert their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can update their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can delete their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can view all repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can insert repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can update repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Admins can delete repair order parts" ON repair_order_parts;

-- Habilitar RLS
ALTER TABLE repair_order_parts ENABLE ROW LEVEL SECURITY;

-- Crear políticas para administradores
CREATE POLICY "Admins can view all repair order parts"
  ON repair_order_parts FOR SELECT
  USING (is_current_user_admin() = true);

CREATE POLICY "Admins can insert repair order parts"
  ON repair_order_parts FOR INSERT
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can update repair order parts"
  ON repair_order_parts FOR UPDATE
  USING (is_current_user_admin() = true)
  WITH CHECK (is_current_user_admin() = true);

CREATE POLICY "Admins can delete repair order parts"
  ON repair_order_parts FOR DELETE
  USING (is_current_user_admin() = true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que todas las políticas se crearon correctamente
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
  'repair_order_parts'
)
ORDER BY tablename, cmd, policyname;

-- NOTA IMPORTANTE:
-- Este script configura todas las tablas para que solo los administradores puedan acceder.
-- Un usuario es administrador si:
-- 1. Existe un registro en la tabla employees con su id (auth.uid())
-- 2. El campo 'role' es 'admin'
-- 3. El campo 'status' es 'active'
--
-- Si necesitas verificar que eres administrador:
-- SELECT is_current_user_admin();
--
-- Si necesitas ver tu registro de empleado:
-- SELECT * FROM employees WHERE id = auth.uid();

