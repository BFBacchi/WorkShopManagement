// Type definitions for POS module

export type ProductCategory = 'device' | 'accessory' | 'part';
export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed';
export type DiscountType = 'percentage' | 'fixed' | 'none';

export interface Product {
  _uid: string;
  _id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  model?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  status: ProductStatus;
  image_url?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  _uid: string;
  _id: string;
  sale_number: string;
  items: string; // JSON string of CartItem[]
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  total: number;
  payment_method: PaymentMethod;
  payment_details?: string; // JSON string of PaymentDetail[]
  customer_name?: string;
  customer_phone?: string;
  cashier_name: string;
  sale_date: string;
  notes?: string;
}
