import { create } from 'zustand';
import { RepairOrder, Customer } from '../types';

interface RepairsStore {
  orders: RepairOrder[];
  customers: Customer[];
  selectedOrder: RepairOrder | null;
  isLoading: boolean;
  
  setOrders: (orders: RepairOrder[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setSelectedOrder: (order: RepairOrder | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  addOrder: (order: RepairOrder) => void;
  updateOrder: (orderId: string, updates: Partial<RepairOrder>) => void;
  
  addCustomer: (customer: Customer) => void;
  findCustomerByPhone: (phone: string) => Customer | undefined;
}

export const useRepairsStore = create<RepairsStore>((set, get) => ({
  orders: [],
  customers: [],
  selectedOrder: null,
  isLoading: false,
  
  setOrders: (orders) => set({ orders }),
  setCustomers: (customers) => set({ customers }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders] 
  })),
  
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(order => 
      order._id === orderId 
        ? { ...order, ...updates, updated_at: new Date().toISOString() }
        : order
    ),
    selectedOrder: state.selectedOrder?._id === orderId
      ? { ...state.selectedOrder, ...updates, updated_at: new Date().toISOString() }
      : state.selectedOrder
  })),
  
  addCustomer: (customer) => set((state) => ({ 
    customers: [customer, ...state.customers] 
  })),
  
  findCustomerByPhone: (phone) => {
    return get().customers.find(c => c.phone === phone);
  }
}));
