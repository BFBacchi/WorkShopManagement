-- ============================================
-- Phase 4: Inventory Management Tables
-- Migration Script - Execute this in Supabase SQL Editor
-- ============================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_id TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory movements table (tracking entry/exit)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  reference_type TEXT CHECK (reference_type IN ('purchase', 'sale', 'repair', 'adjustment', 'transfer')),
  reference_id UUID, -- Can reference sales, repair_orders, etc.
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serial numbers / IMEI registry table
CREATE TABLE IF NOT EXISTS serial_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  imei TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'in_repair', 'returned', 'defective')),
  purchase_date TIMESTAMP WITH TIME ZONE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  repair_order_id UUID REFERENCES repair_orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, serial_number)
);

-- Repair order parts usage table (link parts to repair orders)
CREATE TABLE IF NOT EXISTS repair_order_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repair_order_id UUID NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10, 2) NOT NULL CHECK (unit_cost >= 0),
  total_cost DECIMAL(10, 2) NOT NULL CHECK (total_cost >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id ON inventory_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_serial_registry_user_id ON serial_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_serial_registry_product_id ON serial_registry(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_registry_serial_number ON serial_registry(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_registry_imei ON serial_registry(imei);
CREATE INDEX IF NOT EXISTS idx_serial_registry_status ON serial_registry(status);
CREATE INDEX IF NOT EXISTS idx_repair_order_parts_user_id ON repair_order_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_parts_repair_order_id ON repair_order_parts(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_repair_order_parts_product_id ON repair_order_parts(product_id);

-- Enable Row Level Security for new tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_order_parts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for safety, then recreate)
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

DROP POLICY IF EXISTS "Users can view their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can insert their own inventory movements" ON inventory_movements;
DROP POLICY IF EXISTS "Users can update their own inventory movements" ON inventory_movements;

DROP POLICY IF EXISTS "Users can view their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can insert their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can update their own serial registry" ON serial_registry;
DROP POLICY IF EXISTS "Users can delete their own serial registry" ON serial_registry;

DROP POLICY IF EXISTS "Users can view their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can insert their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can update their own repair order parts" ON repair_order_parts;
DROP POLICY IF EXISTS "Users can delete their own repair order parts" ON repair_order_parts;

-- RLS Policies for suppliers
CREATE POLICY "Users can view their own suppliers"
  ON suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON suppliers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for inventory_movements
CREATE POLICY "Users can view their own inventory movements"
  ON inventory_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory movements"
  ON inventory_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory movements"
  ON inventory_movements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for serial_registry
CREATE POLICY "Users can view their own serial registry"
  ON serial_registry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own serial registry"
  ON serial_registry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own serial registry"
  ON serial_registry FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own serial registry"
  ON serial_registry FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for repair_order_parts
CREATE POLICY "Users can view their own repair order parts"
  ON repair_order_parts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repair order parts"
  ON repair_order_parts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repair order parts"
  ON repair_order_parts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repair order parts"
  ON repair_order_parts FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_serial_registry_updated_at ON serial_registry;
CREATE TRIGGER update_serial_registry_updated_at
  BEFORE UPDATE ON serial_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update product stock when inventory movement is created
CREATE OR REPLACE FUNCTION update_product_stock_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entry' THEN
    UPDATE products 
    SET stock = stock + NEW.quantity 
    WHERE id = NEW.product_id AND user_id = NEW.user_id;
  ELSIF NEW.movement_type = 'exit' THEN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id AND user_id = NEW.user_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE products 
    SET stock = NEW.new_stock 
    WHERE id = NEW.product_id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock automatically
DROP TRIGGER IF EXISTS trigger_update_product_stock ON inventory_movements;
CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_on_movement();

