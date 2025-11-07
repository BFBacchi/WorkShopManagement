// Type definitions for Inventory module

export type SupplierStatus = 'active' | 'inactive';
export type MovementType = 'entry' | 'exit' | 'adjustment' | 'transfer';
export type ReferenceType = 'purchase' | 'sale' | 'repair' | 'adjustment' | 'transfer';
export type SerialStatus = 'available' | 'sold' | 'in_repair' | 'returned' | 'defective';

export interface Supplier {
  _uid: string;
  _id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_id?: string;
  notes?: string;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  _uid: string;
  _id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number;
  supplier_id?: string;
  reference_type?: ReferenceType;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface SerialRegistry {
  _uid: string;
  _id: string;
  product_id: string;
  serial_number: string;
  imei?: string;
  status: SerialStatus;
  purchase_date?: string;
  sale_id?: string;
  repair_order_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RepairOrderPart {
  _uid: string;
  _id: string;
  repair_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  created_at: string;
}

// Filter types for inventory catalog
export interface InventoryFilters {
  search: string;
  category: string; // 'all' | 'device' | 'accessory' | 'part'
  brand: string; // 'all' | specific brand
  status: string; // 'all' | 'active' | 'inactive' | 'discontinued'
  stockStatus: string; // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  minPrice?: number;
  maxPrice?: number;
  supplier?: string; // 'all' | supplier id
}

