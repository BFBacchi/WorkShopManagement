// Customers Store - Complete customer management

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Customer, CustomerHistory, MaintenanceReminder } from '../types';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  customerHistory: CustomerHistory[];
  reminders: MaintenanceReminder[];
  loading: boolean;
  loadingHistory: boolean;
  loadingReminders: boolean;
  searchQuery: string;
  filterStatus: 'all' | 'with_points' | 'recent' | 'vip';

  // Actions
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<void>;
  fetchCustomerHistory: (customerId: string) => Promise<void>;
  addCustomer: (customerData: Partial<Customer>) => Promise<Customer | null>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addLoyaltyPoints: (customerId: string, points: number, reason: string) => Promise<void>;
  redeemLoyaltyPoints: (customerId: string, points: number) => Promise<void>;
  fetchReminders: () => Promise<void>;
  createReminder: (reminderData: Partial<MaintenanceReminder>) => Promise<void>;
  markReminderSent: (reminderId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'with_points' | 'recent' | 'vip') => void;
  getFilteredCustomers: () => Customer[];
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  // Initial state
  customers: [],
  selectedCustomer: null,
  customerHistory: [],
  reminders: [],
  loading: false,
  loadingHistory: false,
  loadingReminders: false,
  searchQuery: '',
  filterStatus: 'all',

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional stats for each customer
      const customersWithStats: Customer[] = await Promise.all(
        (data || []).map(async (customer: any) => {
          // Get repair orders count
          const { count: repairCount } = await supabase
            .from('repair_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.uid)
            .eq('customer_id', customer.id);

          // Get sales count and total
          const { data: sales } = await supabase
            .from('sales')
            .select('total')
            .eq('user_id', user.uid)
            .or(`customer_phone.eq.${customer.phone},customer_name.ilike.%${customer.name}%`);

          const totalSpent = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
          const totalOrders = (repairCount || 0) + (sales?.length || 0);

          // Get last visit (most recent repair or sale)
          const { data: lastRepair } = await supabase
            .from('repair_orders')
            .select('created_at')
            .eq('user_id', user.uid)
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { data: lastSale } = await supabase
            .from('sales')
            .select('sale_date')
            .eq('user_id', user.uid)
            .or(`customer_phone.eq.${customer.phone},customer_name.ilike.%${customer.name}%`)
            .order('sale_date', { ascending: false })
            .limit(1)
            .single();

          let lastVisit: string | undefined;
          if (lastRepair?.created_at && lastSale?.sale_date) {
            lastVisit =
              new Date(lastRepair.created_at) > new Date(lastSale.sale_date)
                ? lastRepair.created_at
                : lastSale.sale_date;
          } else if (lastRepair?.created_at) {
            lastVisit = lastRepair.created_at;
          } else if (lastSale?.sale_date) {
            lastVisit = lastSale.sale_date;
          }

          return {
            _uid: customer.user_id,
            _id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            loyalty_points: customer.loyalty_points || 0,
            total_spent: totalSpent,
            total_orders: totalOrders,
            last_visit: lastVisit,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
          };
        })
      );

      set({ customers: customersWithStats });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCustomerById: async (id: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.uid)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Calculate stats
        const { count: repairCount } = await supabase
          .from('repair_orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.uid)
          .eq('customer_id', data.id);

        const { data: sales } = await supabase
          .from('sales')
          .select('total')
          .eq('user_id', user.uid)
          .or(`customer_phone.eq.${data.phone},customer_name.ilike.%${data.name}%`);

        const totalSpent = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
        const totalOrders = (repairCount || 0) + (sales?.length || 0);

        const customer: Customer = {
          _uid: data.user_id,
          _id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          loyalty_points: data.loyalty_points || 0,
          total_spent: totalSpent,
          total_orders: totalOrders,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        set({ selectedCustomer: customer });
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  },

  fetchCustomerHistory: async (customerId: string) => {
    set({ loadingHistory: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const history: CustomerHistory[] = [];

      // Fetch repair orders
      const { data: repairs } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', user.uid)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      repairs?.forEach((repair: any) => {
        history.push({
          type: 'repair',
          id: repair.id,
          date: repair.created_at,
          description: `Orden ${repair.order_number} - ${repair.device_brand} ${repair.device_model}`,
          amount: repair.final_cost || repair.estimated_cost,
          status: repair.status,
        });
      });

      // Fetch sales
      const customer = get().customers.find((c) => c._id === customerId);
      if (customer) {
        const { data: sales } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', user.uid)
          .or(`customer_phone.eq.${customer.phone},customer_name.ilike.%${customer.name}%`)
          .order('sale_date', { ascending: false });

        sales?.forEach((sale: any) => {
          history.push({
            type: 'sale',
            id: sale.id,
            date: sale.sale_date,
            description: `Venta ${sale.sale_number}`,
            amount: sale.total,
          });
        });
      }

      // Sort by date
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      set({ customerHistory: history });
    } catch (error) {
      console.error('Error fetching customer history:', error);
    } finally {
      set({ loadingHistory: false });
    }
  },

  addCustomer: async (customerData: Partial<Customer>) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.uid,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          loyalty_points: customerData.loyalty_points || 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newCustomer: Customer = {
        _uid: data.user_id,
        _id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        loyalty_points: data.loyalty_points || 0,
        total_spent: 0,
        total_orders: 0,
        created_at: data.created_at,
      };

      set((state) => ({
        customers: [newCustomer, ...state.customers],
      }));

      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          loyalty_points: customerData.loyalty_points,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.uid)
        .eq('id', id);

      if (error) throw error;

      await get().fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('user_id', user.uid)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        customers: state.customers.filter((c) => c._id !== id),
      }));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  },

  addLoyaltyPoints: async (customerId: string, points: number, reason: string) => {
    try {
      const customer = get().customers.find((c) => c._id === customerId);
      if (!customer) throw new Error('Cliente no encontrado');

      const newPoints = (customer.loyalty_points || 0) + points;
      await get().updateCustomer(customerId, { loyalty_points: newPoints });
    } catch (error) {
      console.error('Error adding loyalty points:', error);
    }
  },

  redeemLoyaltyPoints: async (customerId: string, points: number) => {
    try {
      const customer = get().customers.find((c) => c._id === customerId);
      if (!customer) throw new Error('Cliente no encontrado');

      const currentPoints = customer.loyalty_points || 0;
      if (currentPoints < points) {
        throw new Error('Puntos insuficientes');
      }

      const newPoints = currentPoints - points;
      await get().updateCustomer(customerId, { loyalty_points: newPoints });
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  },

  fetchReminders: async () => {
    set({ loadingReminders: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      // Try to fetch from maintenance_reminders table first
      const { data: remindersData, error: remindersError } = await supabase
        .from('maintenance_reminders')
        .select('*')
        .eq('user_id', user.uid)
        .order('reminder_date', { ascending: true });

      if (!remindersError && remindersData) {
        const reminders: MaintenanceReminder[] = remindersData.map((r: any) => ({
          id: r.id,
          customer_id: r.customer_id,
          customer_name: r.customer_name,
          customer_phone: r.customer_phone,
          customer_email: r.customer_email,
          device_brand: r.device_brand,
          device_model: r.device_model,
          reminder_date: r.reminder_date,
          message: r.message || `Recordatorio de mantenimiento para ${r.device_brand} ${r.device_model}`,
          sent: r.sent || false,
          created_at: r.created_at,
        }));
        set({ reminders });
        return;
      }

      // Fallback: Create reminders from repair orders if table doesn't exist
      const { data: repairs } = await supabase
        .from('repair_orders')
        .select('*, customers(*)')
        .eq('user_id', user.uid)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      const reminders: MaintenanceReminder[] = [];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      repairs?.forEach((repair: any) => {
        if (repair.delivered_at && new Date(repair.delivered_at) < sixMonthsAgo) {
          reminders.push({
            id: `reminder-${repair.id}`,
            customer_id: repair.customer_id,
            customer_name: repair.customer_name,
            customer_phone: repair.customer_phone,
            customer_email: repair.customers?.email,
            device_brand: repair.device_brand,
            device_model: repair.device_model,
            reminder_date: new Date(
              new Date(repair.delivered_at).getTime() + 6 * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            message: `Recordatorio de mantenimiento para ${repair.device_brand} ${repair.device_model}`,
            sent: false,
            created_at: new Date().toISOString(),
          });
        }
      });

      set({ reminders });
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      set({ loadingReminders: false });
    }
  },

  createReminder: async (reminderData: Partial<MaintenanceReminder>) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('maintenance_reminders')
        .insert({
          user_id: user.uid,
          customer_id: reminderData.customer_id!,
          customer_name: reminderData.customer_name!,
          customer_phone: reminderData.customer_phone!,
          customer_email: reminderData.customer_email,
          device_brand: reminderData.device_brand!,
          device_model: reminderData.device_model!,
          reminder_date: reminderData.reminder_date!,
          message: reminderData.message || 'Recordatorio de mantenimiento',
          sent: false,
        })
        .select()
        .single();

      if (error) throw error;

      const reminder: MaintenanceReminder = {
        id: data.id,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        device_brand: data.device_brand,
        device_model: data.device_model,
        reminder_date: data.reminder_date,
        message: data.message,
        sent: data.sent,
        created_at: data.created_at,
      };

      set((state) => ({
        reminders: [...state.reminders, reminder],
      }));
    } catch (error) {
      console.error('Error creating reminder:', error);
      // Fallback to local state if table doesn't exist
      const reminder: MaintenanceReminder = {
        id: `reminder-${Date.now()}`,
        customer_id: reminderData.customer_id!,
        customer_name: reminderData.customer_name!,
        customer_phone: reminderData.customer_phone!,
        customer_email: reminderData.customer_email,
        device_brand: reminderData.device_brand!,
        device_model: reminderData.device_model!,
        reminder_date: reminderData.reminder_date!,
        message: reminderData.message || 'Recordatorio de mantenimiento',
        sent: false,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        reminders: [...state.reminders, reminder],
      }));
    }
  },

  markReminderSent: async (reminderId: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      // Try to update in database
      const { error } = await supabase
        .from('maintenance_reminders')
        .update({ sent: true })
        .eq('user_id', user.uid)
        .eq('id', reminderId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        reminders: state.reminders.map((r) =>
          r.id === reminderId ? { ...r, sent: true } : r
        ),
      }));
    } catch (error) {
      // Fallback to local state update if table doesn't exist
      console.error('Error updating reminder:', error);
      set((state) => ({
        reminders: state.reminders.map((r) =>
          r.id === reminderId ? { ...r, sent: true } : r
        ),
      }));
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterStatus: (status: 'all' | 'with_points' | 'recent' | 'vip') =>
    set({ filterStatus: status }),

  getFilteredCustomers: () => {
    const { customers, searchQuery, filterStatus } = get();
    let filtered = [...customers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          customer.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (filterStatus) {
      case 'with_points':
        filtered = filtered.filter((c) => (c.loyalty_points || 0) > 0);
        break;
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(
          (c) => c.last_visit && new Date(c.last_visit) > thirtyDaysAgo
        );
        break;
      case 'vip':
        filtered = filtered.filter((c) => (c.total_spent || 0) > 1000);
        break;
    }

    return filtered;
  },
}));

