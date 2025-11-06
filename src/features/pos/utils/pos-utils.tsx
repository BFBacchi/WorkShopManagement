// Utility functions for POS module

import type { DiscountType } from '../types';

/**
 * Calculate discount amount based on type
 */
export function calculateDiscount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountType === 'none' || discountValue === 0) return 0;
  
  if (discountType === 'percentage') {
    return (subtotal * discountValue) / 100;
  }
  
  // Fixed discount
  return Math.min(discountValue, subtotal);
}

/**
 * Format currency in MXN
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Generate unique sale number
 */
export function generateSaleNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `V${year}${month}${day}-${random}`;
}

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'device':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'accessory':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'part':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'device':
      return 'Smartphone';
    case 'accessory':
      return 'Headphones';
    case 'part':
      return 'Wrench';
    default:
      return 'Package';
  }
}

/**
 * Check if product has low stock
 */
export function hasLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock;
}
