// Zustand store for Inventory module

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { Product, ProductCategory, ProductStatus } from '@/features/pos/types';
import type { 
  Supplier, 
  InventoryMovement, 
  SerialRegistry, 
  RepairOrderPart,
  InventoryFilters 
} from '@/features/inventory/types';

interface InventoryState {
  // Products (reused from POS but with inventory-specific operations)
  products: Product[];
  loadingProducts: boolean;
  
  // Suppliers
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  
  // Inventory Movements
  movements: InventoryMovement[];
  loadingMovements: boolean;
  
  // Serial Registry
  serials: SerialRegistry[];
  loadingSerials: boolean;
  
  // Filters
  filters: InventoryFilters;
  
  // Actions - Products
  fetchProducts: (filters?: InventoryFilters) => Promise<void>;
  addProduct: (product: Omit<Product, '_uid' | '_id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  
  // Actions - Suppliers
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, '_uid' | '_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  
  // Actions - Inventory Movements
  fetchMovements: (productId?: string, limit?: number) => Promise<void>;
  addMovement: (movement: Omit<InventoryMovement, '_uid' | '_id' | 'created_at'>) => Promise<void>;
  
  // Actions - Serial Registry
  fetchSerials: (productId?: string) => Promise<void>;
  addSerial: (serial: Omit<SerialRegistry, '_uid' | '_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSerial: (serial: SerialRegistry) => Promise<void>;
  
  // Actions - Filters
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
  
  // Actions - Repair Order Parts
  fetchRepairOrderParts: (repairOrderId: string) => Promise<RepairOrderPart[]>;
  addRepairOrderPart: (part: Omit<RepairOrderPart, '_uid' | '_id' | 'created_at'>) => Promise<void>;
  deleteRepairOrderPart: (partId: string) => Promise<void>;
  
  // Computed
  getFilteredProducts: () => Product[];
  getBrands: () => string[];
  getCategories: () => ProductCategory[];
}

const defaultFilters: InventoryFilters = {
  search: '',
  category: 'all',
  brand: 'all',
  status: 'all',
  stockStatus: 'all',
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  products: [],
  loadingProducts: false,
  suppliers: [],
  loadingSuppliers: false,
  movements: [],
  loadingMovements: false,
  serials: [],
  loadingSerials: false,
  filters: defaultFilters,
  
  // Fetch products with optional filters
  fetchProducts: async (filters) => {
    set({ loadingProducts: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', user.uid);
      
      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.brand && filters.brand !== 'all') {
        query = query.eq('brand', filters.brand);
      }
      
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
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
  
  // Get low stock products
  getLowStockProducts: () => {
    return get().products.filter(
      p => p.stock > 0 && p.stock <= p.min_stock && p.status === 'active'
    );
  },
  
  // Get out of stock products
  getOutOfStockProducts: () => {
    return get().products.filter(
      p => p.stock === 0 && p.status === 'active'
    );
  },
  
  // Add new product
  addProduct: async (productData: Omit<Product, '_uid' | '_id'>) => {
    try {
      // Verify session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente.');
      }
      
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verify user_id matches session
      if (user.uid !== session.user.id) {
        throw new Error('Error de autenticación: ID de usuario no coincide');
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: session.user.id, // Use session user.id instead of store user.uid
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
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error al agregar producto: ${error.message}`);
      }
      
      // Refresh products list
      await get().fetchProducts(get().filters);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },
  
  // Update product
  updateProduct: async (product) => {
    try {
      // Verify session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente.');
      }
      
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }
      
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
        .eq('user_id', session.user.id); // Use session user.id
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error al actualizar producto: ${error.message}`);
      }
      
      // Refresh products list
      await get().fetchProducts(get().filters);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  // Delete product
  deleteProduct: async (productId) => {
    try {
      // Verify session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente.');
      }
      
      const user = useAuthStore.getState().user;
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', session.user.id); // Use session user.id
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error al eliminar producto: ${error.message}`);
      }
      
      // Refresh products list
      await get().fetchProducts(get().filters);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
  
  // Fetch suppliers
  fetchSuppliers: async () => {
    set({ loadingSuppliers: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.uid)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      const suppliers: Supplier[] = (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        name: item.name,
        contact_name: item.contact_name,
        phone: item.phone,
        email: item.email,
        address: item.address,
        tax_id: item.tax_id,
        notes: item.notes,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      set({ suppliers });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      set({ loadingSuppliers: false });
    }
  },
  
  // Add supplier
  addSupplier: async (supplierData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('suppliers')
        .insert({
          user_id: user.uid,
          name: supplierData.name,
          contact_name: supplierData.contact_name,
          phone: supplierData.phone,
          email: supplierData.email,
          address: supplierData.address,
          tax_id: supplierData.tax_id,
          notes: supplierData.notes,
          status: supplierData.status,
        });
      
      if (error) throw error;
      
      await get().fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  },
  
  // Update supplier
  updateSupplier: async (supplier) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          contact_name: supplier.contact_name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          tax_id: supplier.tax_id,
          notes: supplier.notes,
          status: supplier.status,
        })
        .eq('id', supplier._id)
        .eq('user_id', supplier._uid);
      
      if (error) throw error;
      
      await get().fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },
  
  // Delete supplier
  deleteSupplier: async (supplierId) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId)
        .eq('user_id', user.uid);
      
      if (error) throw error;
      
      await get().fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },
  
  // Fetch inventory movements
  fetchMovements: async (productId, limit = 100) => {
    set({ loadingMovements: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      let query = supabase
        .from('inventory_movements')
        .select('*')
        .eq('user_id', user.uid);
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      const movements: InventoryMovement[] = (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        product_id: item.product_id,
        movement_type: item.movement_type,
        quantity: item.quantity,
        previous_stock: item.previous_stock,
        new_stock: item.new_stock,
        unit_cost: item.unit_cost,
        supplier_id: item.supplier_id,
        reference_type: item.reference_type,
        reference_id: item.reference_id,
        notes: item.notes,
        created_by: item.created_by,
        created_at: item.created_at,
      }));
      
      set({ movements });
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      set({ loadingMovements: false });
    }
  },
  
  // Add inventory movement
  addMovement: async (movementData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      // Get current stock
      const { data: productData } = await supabase
        .from('products')
        .select('stock')
        .eq('id', movementData.product_id)
        .eq('user_id', user.uid)
        .single();
      
      if (!productData) throw new Error('Producto no encontrado');
      
      const previousStock = productData.stock;
      let newStock = previousStock;
      
      if (movementData.movement_type === 'entry') {
        newStock = previousStock + movementData.quantity;
      } else if (movementData.movement_type === 'exit') {
        newStock = previousStock - movementData.quantity;
      } else if (movementData.movement_type === 'adjustment') {
        newStock = movementData.new_stock;
      }
      
      const { error } = await supabase
        .from('inventory_movements')
        .insert({
          user_id: user.uid,
          product_id: movementData.product_id,
          movement_type: movementData.movement_type,
          quantity: movementData.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          unit_cost: movementData.unit_cost,
          supplier_id: movementData.supplier_id,
          reference_type: movementData.reference_type,
          reference_id: movementData.reference_id,
          notes: movementData.notes,
          created_by: movementData.created_by,
        });
      
      if (error) throw error;
      
      // Refresh products to get updated stock
      await get().fetchProducts();
      await get().fetchMovements(movementData.product_id);
    } catch (error) {
      console.error('Error adding movement:', error);
      throw error;
    }
  },
  
  // Fetch serial registry
  fetchSerials: async (productId) => {
    set({ loadingSerials: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      let query = supabase
        .from('serial_registry')
        .select('*')
        .eq('user_id', user.uid);
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const serials: SerialRegistry[] = (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        product_id: item.product_id,
        serial_number: item.serial_number,
        imei: item.imei,
        status: item.status,
        purchase_date: item.purchase_date,
        sale_id: item.sale_id,
        repair_order_id: item.repair_order_id,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      set({ serials });
    } catch (error) {
      console.error('Error fetching serials:', error);
    } finally {
      set({ loadingSerials: false });
    }
  },
  
  // Add serial
  addSerial: async (serialData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('serial_registry')
        .insert({
          user_id: user.uid,
          product_id: serialData.product_id,
          serial_number: serialData.serial_number,
          imei: serialData.imei,
          status: serialData.status,
          purchase_date: serialData.purchase_date,
          sale_id: serialData.sale_id,
          repair_order_id: serialData.repair_order_id,
          notes: serialData.notes,
        });
      
      if (error) throw error;
      
      await get().fetchSerials(serialData.product_id);
    } catch (error) {
      console.error('Error adding serial:', error);
      throw error;
    }
  },
  
  // Update serial
  updateSerial: async (serial) => {
    try {
      const { error } = await supabase
        .from('serial_registry')
        .update({
          serial_number: serial.serial_number,
          imei: serial.imei,
          status: serial.status,
          purchase_date: serial.purchase_date,
          sale_id: serial.sale_id,
          repair_order_id: serial.repair_order_id,
          notes: serial.notes,
        })
        .eq('id', serial._id)
        .eq('user_id', serial._uid);
      
      if (error) throw error;
      
      await get().fetchSerials(serial.product_id);
    } catch (error) {
      console.error('Error updating serial:', error);
      throw error;
    }
  },
  
  // Set filters
  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    // Auto-fetch products with new filters (only server-side filters)
    get().fetchProducts(updatedFilters);
  },
  
  // Reset filters
  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchProducts();
  },
  
  // Fetch repair order parts
  fetchRepairOrderParts: async (repairOrderId) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('repair_order_parts')
        .select('*')
        .eq('user_id', user.uid)
        .eq('repair_order_id', repairOrderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        repair_order_id: item.repair_order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        notes: item.notes,
        created_at: item.created_at,
      }));
    } catch (error) {
      console.error('Error fetching repair order parts:', error);
      throw error;
    }
  },
  
  // Add repair order part
  addRepairOrderPart: async (partData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('repair_order_parts')
        .insert({
          user_id: user.uid,
          repair_order_id: partData.repair_order_id,
          product_id: partData.product_id,
          quantity: partData.quantity,
          unit_cost: partData.unit_cost,
          total_cost: partData.total_cost,
          notes: partData.notes,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error adding repair order part:', error);
      throw error;
    }
  },
  
  // Delete repair order part
  deleteRepairOrderPart: async (partId) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('repair_order_parts')
        .delete()
        .eq('id', partId)
        .eq('user_id', user.uid);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting repair order part:', error);
      throw error;
    }
  },
  
  // Get filtered products (client-side filtering for search)
  getFilteredProducts: () => {
    const { products, filters } = get();
    let filtered = [...products];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        (p.model && p.model.toLowerCase().includes(searchLower))
      );
    }
    
    // Stock status filter
    if (filters.stockStatus === 'low_stock') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.min_stock);
    } else if (filters.stockStatus === 'out_of_stock') {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (filters.stockStatus === 'in_stock') {
      filtered = filtered.filter(p => p.stock > p.min_stock);
    }
    
    return filtered;
  },
  
  // Get unique brands
  getBrands: () => {
    const brands = new Set(get().products.map(p => p.brand));
    return Array.from(brands).sort();
  },
  
  // Get categories
  getCategories: () => {
    return ['device', 'accessory', 'part'] as ProductCategory[];
  },
}));

