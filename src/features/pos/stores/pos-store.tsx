// Zustand store for POS module

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { 
  Product, 
  CartItem, 
  Sale, 
  DiscountType, 
  PaymentMethod,
  PaymentDetail 
} from '../types';
import { calculateDiscount, generateSaleNumber } from '../utils/pos-utils';

interface POSState {
  // Products
  products: Product[];
  loadingProducts: boolean;
  
  // Cart
  cart: CartItem[];
  discountType: DiscountType;
  discountValue: number;
  customerName: string;
  customerPhone: string;
  notes: string;
  
  // Sales
  sales: Sale[];
  loadingSales: boolean;
  
  // Actions - Products
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, '_uid' | '_id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  
  // Actions - Cart
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (type: DiscountType, value: number) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setNotes: (notes: string) => void;
  
  // Actions - Checkout
  completeSale: (paymentMethod: PaymentMethod, paymentDetails?: PaymentDetail[]) => Promise<Sale | null>;
  
  // Actions - Sales History
  fetchSales: (limit?: number) => Promise<void>;
  
  // Computed
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  // Initial state
  products: [],
  loadingProducts: false,
  cart: [],
  discountType: 'none',
  discountValue: 0,
  customerName: '',
  customerPhone: '',
  notes: '',
  sales: [],
  loadingSales: false,
  
  // Fetch products from database
  fetchProducts: async () => {
    set({ loadingProducts: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Map Supabase data to Product format
      const products: Product[] = (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        brand: item.brand,
        model: item.model,
        sku: item.sku,
        barcode: item.barcode,
        price: item.price,
        cost: item.cost,
        stock: item.stock,
        min_stock: item.min_stock,
        status: item.status,
        image_url: item.image_url,
        description: item.description,
      }));
      
      set({ products });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      set({ loadingProducts: false });
    }
  },
  
  // Add new product
  addProduct: async (productData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user.uid,
          name: productData.name,
          category: productData.category,
          subcategory: productData.subcategory,
          brand: productData.brand,
          model: productData.model,
          sku: productData.sku,
          barcode: productData.barcode,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          min_stock: productData.min_stock,
          status: productData.status,
          image_url: productData.image_url,
          description: productData.description,
        });
      
      if (error) throw error;
      
      // Refresh products list
      await get().fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },
  
  // Update product
  updateProduct: async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          model: product.model,
          sku: product.sku,
          barcode: product.barcode,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          min_stock: product.min_stock,
          status: product.status,
          image_url: product.image_url,
          description: product.description,
        })
        .eq('id', product._id)
        .eq('user_id', product._uid);
      
      if (error) throw error;
      
      // Refresh products list
      await get().fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  // Add product to cart
  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        alert(`Stock insuficiente. Disponible: ${product.stock}`);
        return;
      }
      
      set({
        cart: cart.map(item =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: product.price * newQuantity,
              }
            : item
        ),
      });
    } else {
      // Add new item
      if (quantity > product.stock) {
        alert(`Stock insuficiente. Disponible: ${product.stock}`);
        return;
      }
      
      set({
        cart: [
          ...cart,
          {
            product,
            quantity,
            subtotal: product.price * quantity,
          },
        ],
      });
    }
  },
  
  // Remove from cart
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.product._id !== productId) });
  },
  
  // Update cart quantity
  updateCartQuantity: (productId, quantity) => {
    const { cart } = get();
    const item = cart.find(item => item.product._id === productId);
    
    if (!item) return;
    
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    if (quantity > item.product.stock) {
      alert(`Stock insuficiente. Disponible: ${item.product.stock}`);
      return;
    }
    
    set({
      cart: cart.map(item =>
        item.product._id === productId
          ? {
              ...item,
              quantity,
              subtotal: item.product.price * quantity,
            }
          : item
      ),
    });
  },
  
  // Clear cart
  clearCart: () => {
    set({
      cart: [],
      discountType: 'none',
      discountValue: 0,
      customerName: '',
      customerPhone: '',
      notes: '',
    });
  },
  
  // Set discount
  setDiscount: (type, value) => {
    set({ discountType: type, discountValue: value });
  },
  
  // Set customer info
  setCustomerInfo: (name, phone) => {
    set({ customerName: name, customerPhone: phone });
  },
  
  // Set notes
  setNotes: (notes) => {
    set({ notes });
  },
  
  // Complete sale
  completeSale: async (paymentMethod, paymentDetails) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { cart, discountType, discountValue, customerName, customerPhone, notes } = get();
      
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }
      
      const subtotal = get().getCartSubtotal();
      const discount = get().getCartDiscount();
      const total = get().getCartTotal();
      
      // Create sale record
      const saleData: Omit<Sale, '_id'> = {
        _uid: user.uid,
        sale_number: generateSaleNumber(),
        items: JSON.stringify(cart),
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        total,
        payment_method: paymentMethod,
        payment_details: paymentDetails ? JSON.stringify(paymentDetails) : undefined,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        cashier_name: user.email || 'Cajero',
        sale_date: new Date().toISOString(),
        notes: notes || undefined,
      };
      
      // Insert sale
      const { data: insertedSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.uid,
          sale_number: saleData.sale_number,
          items: saleData.items,
          subtotal: saleData.subtotal,
          discount_type: saleData.discount_type,
          discount_value: saleData.discount_value,
          total: saleData.total,
          payment_method: saleData.payment_method,
          payment_details: saleData.payment_details,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone,
          cashier_name: saleData.cashier_name,
          sale_date: saleData.sale_date,
          notes: saleData.notes,
        })
        .select()
        .single();
      
      if (saleError) throw saleError;
      
      // Update stock for each product
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity;
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product._id)
          .eq('user_id', item.product._uid);
        
        if (updateError) {
          console.error(`Error updating stock for product ${item.product._id}:`, updateError);
        }
      }
      
      // Clear cart
      get().clearCart();
      
      // Refresh products to update stock
      await get().fetchProducts();
      
      // Map inserted sale to Sale format
      const sale: Sale = insertedSale ? {
        _uid: insertedSale.user_id,
        _id: insertedSale.id,
        sale_number: insertedSale.sale_number,
        items: insertedSale.items,
        subtotal: insertedSale.subtotal,
        discount_type: insertedSale.discount_type,
        discount_value: insertedSale.discount_value,
        total: insertedSale.total,
        payment_method: insertedSale.payment_method,
        payment_details: insertedSale.payment_details,
        customer_name: insertedSale.customer_name,
        customer_phone: insertedSale.customer_phone,
        cashier_name: insertedSale.cashier_name,
        sale_date: insertedSale.sale_date,
        notes: insertedSale.notes,
      } : saleData as Sale;
      
      return sale;
    } catch (error) {
      console.error('Error completing sale:', error);
      throw error;
    }
  },
  
  // Fetch sales history
  fetchSales: async (limit = 50) => {
    set({ loadingSales: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Map Supabase data to Sale format
      const sales: Sale[] = (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        sale_number: item.sale_number,
        items: item.items,
        subtotal: item.subtotal,
        discount_type: item.discount_type,
        discount_value: item.discount_value,
        total: item.total,
        payment_method: item.payment_method,
        payment_details: item.payment_details,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        cashier_name: item.cashier_name,
        sale_date: item.sale_date,
        notes: item.notes,
      }));
      
      set({ sales });
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      set({ loadingSales: false });
    }
  },
  
  // Computed - Get cart subtotal
  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
  },
  
  // Computed - Get cart discount
  getCartDiscount: () => {
    const { discountType, discountValue } = get();
    const subtotal = get().getCartSubtotal();
    return calculateDiscount(subtotal, discountType, discountValue);
  },
  
  // Computed - Get cart total
  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const discount = get().getCartDiscount();
    return subtotal - discount;
  },
}));
