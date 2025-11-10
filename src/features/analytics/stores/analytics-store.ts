// Analytics Store - Data management for analytics dashboard

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

export interface SalesData {
  date: string;
  total: number;
  count: number;
}

export interface RepairMetrics {
  status: string;
  count: number;
  avgTime: number;
  totalRevenue: number;
}

export interface TechnicianPerformance {
  name: string;
  completedOrders: number;
  avgTime: number;
  revenue: number;
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
}

export interface BestSellingProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface AnalyticsState {
  // Sales data
  dailySales: SalesData[];
  weeklySales: SalesData[];
  monthlySales: SalesData[];
  loadingSales: boolean;
  
  // Repair metrics
  repairMetrics: RepairMetrics[];
  loadingRepairs: boolean;
  
  // Technician performance
  technicianPerformance: TechnicianPerformance[];
  loadingTechnicians: boolean;
  
  // Cash flow
  cashFlow: CashFlowData[];
  loadingCashFlow: boolean;
  
  // Best selling products
  bestSellingProducts: BestSellingProduct[];
  loadingProducts: boolean;
  
  // Actions
  fetchSalesData: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  fetchRepairMetrics: () => Promise<void>;
  fetchTechnicianPerformance: () => Promise<void>;
  fetchCashFlow: () => Promise<void>;
  fetchBestSellingProducts: () => Promise<void>;
  loadAllData: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  dailySales: [],
  weeklySales: [],
  monthlySales: [],
  loadingSales: false,
  repairMetrics: [],
  loadingRepairs: false,
  technicianPerformance: [],
  loadingTechnicians: false,
  cashFlow: [],
  loadingCashFlow: false,
  bestSellingProducts: [],
  loadingProducts: false,

  fetchSalesData: async (period) => {
    set({ loadingSales: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.uid)
        .order('sale_date', { ascending: true });

      if (error) throw error;

      // Process data based on period
      const salesMap = new Map<string, { total: number; count: number }>();

      (data || []).forEach((sale: any) => {
        const date = new Date(sale.sale_date);
        let key: string;

        if (period === 'daily') {
          key = date.toISOString().split('T')[0];
        } else if (period === 'weekly') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        const existing = salesMap.get(key) || { total: 0, count: 0 };
        salesMap.set(key, {
          total: existing.total + (sale.total || 0),
          count: existing.count + 1,
        });
      });

      const salesData: SalesData[] = Array.from(salesMap.entries())
        .map(([date, data]) => ({
          date,
          total: data.total,
          count: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (period === 'daily') {
        set({ dailySales: salesData });
      } else if (period === 'weekly') {
        set({ weeklySales: salesData });
      } else {
        set({ monthlySales: salesData });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      set({ loadingSales: false });
    }
  },

  fetchRepairMetrics: async () => {
    set({ loadingRepairs: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', user.uid);

      if (error) throw error;

      // Group by status
      const statusMap = new Map<string, { count: number; totalTime: number; revenue: number }>();

      (data || []).forEach((order: any) => {
        const status = order.status || 'pending';
        const existing = statusMap.get(status) || { count: 0, totalTime: 0, revenue: 0 };

        // Calculate time difference if completed
        let timeDiff = 0;
        if (order.delivered_at && order.created_at) {
          timeDiff = new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime();
          timeDiff = timeDiff / (1000 * 60 * 60); // Convert to hours
        }

        statusMap.set(status, {
          count: existing.count + 1,
          totalTime: existing.totalTime + timeDiff,
          revenue: existing.revenue + (order.final_cost || order.estimated_cost || 0),
        });
      });

      const metrics: RepairMetrics[] = Array.from(statusMap.entries()).map(([status, data]) => ({
        status,
        count: data.count,
        avgTime: data.count > 0 ? data.totalTime / data.count : 0,
        totalRevenue: data.revenue,
      }));

      set({ repairMetrics: metrics });
    } catch (error) {
      console.error('Error fetching repair metrics:', error);
    } finally {
      set({ loadingRepairs: false });
    }
  },

  fetchTechnicianPerformance: async () => {
    set({ loadingTechnicians: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', user.uid)
        .eq('status', 'delivered');

      if (error) throw error;

      // Group by technician
      const techMap = new Map<string, { orders: any[] }>();

      (data || []).forEach((order: any) => {
        const tech = order.assigned_technician || 'Sin asignar';
        const existing = techMap.get(tech) || { orders: [] };
        existing.orders.push(order);
        techMap.set(tech, existing);
      });

      const performance: TechnicianPerformance[] = Array.from(techMap.entries()).map(
        ([name, data]) => {
          const completedOrders = data.orders.length;
          let totalTime = 0;
          let revenue = 0;

          data.orders.forEach((order: any) => {
            if (order.delivered_at && order.created_at) {
              const timeDiff =
                new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime();
              totalTime += timeDiff / (1000 * 60 * 60); // Convert to hours
            }
            revenue += order.final_cost || order.estimated_cost || 0;
          });

          return {
            name,
            completedOrders,
            avgTime: completedOrders > 0 ? totalTime / completedOrders : 0,
            revenue,
          };
        }
      );

      set({ technicianPerformance: performance.sort((a, b) => b.completedOrders - a.completedOrders) });
    } catch (error) {
      console.error('Error fetching technician performance:', error);
    } finally {
      set({ loadingTechnicians: false });
    }
  },

  fetchCashFlow: async () => {
    set({ loadingCashFlow: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      // Fetch sales (income)
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('sale_date, total')
        .eq('user_id', user.uid)
        .order('sale_date', { ascending: true });

      if (salesError) throw salesError;

      // Fetch products for expenses (cost * stock movements would be ideal, but we'll use cost as approximation)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('cost, stock')
        .eq('user_id', user.uid);

      if (productsError) throw productsError;

      // Group sales by date
      const cashFlowMap = new Map<string, { income: number; expenses: number }>();

      (salesData || []).forEach((sale: any) => {
        const date = sale.sale_date.split('T')[0];
        const existing = cashFlowMap.get(date) || { income: 0, expenses: 0 };
        cashFlowMap.set(date, {
          income: existing.income + (sale.total || 0),
          expenses: existing.expenses,
        });
      });

      // Estimate expenses (simplified - in real app would track actual purchases)
      const totalCost = (productsData || []).reduce(
        (sum, p) => sum + ((p.cost || 0) * (p.stock || 0)),
        0
      );
      const avgDailyExpense = totalCost / 30; // Rough estimate

      // Add estimated expenses to cash flow
      cashFlowMap.forEach((value, key) => {
        value.expenses = avgDailyExpense;
      });

      const cashFlow: CashFlowData[] = Array.from(cashFlowMap.entries())
        .map(([date, data]) => ({
          date,
          income: data.income,
          expenses: data.expenses,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      set({ cashFlow });
    } catch (error) {
      console.error('Error fetching cash flow:', error);
    } finally {
      set({ loadingCashFlow: false });
    }
  },

  fetchBestSellingProducts: async () => {
    set({ loadingProducts: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('sales')
        .select('items')
        .eq('user_id', user.uid)
        .limit(100);

      if (error) throw error;

      // Aggregate product sales
      const productMap = new Map<string, { quantity: number; revenue: number }>();

      (data || []).forEach((sale: any) => {
        const items = sale.items || [];
        items.forEach((item: any) => {
          const productName = item.name || 'Producto desconocido';
          const existing = productMap.get(productName) || { quantity: 0, revenue: 0 };
          productMap.set(productName, {
            quantity: existing.quantity + (item.quantity || 1),
            revenue: existing.revenue + (item.subtotal || 0),
          });
        });
      });

      const bestSelling: BestSellingProduct[] = Array.from(productMap.entries())
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      set({ bestSellingProducts: bestSelling });
    } catch (error) {
      console.error('Error fetching best selling products:', error);
    } finally {
      set({ loadingProducts: false });
    }
  },

  loadAllData: async () => {
    await Promise.all([
      get().fetchSalesData('daily'),
      get().fetchSalesData('weekly'),
      get().fetchSalesData('monthly'),
      get().fetchRepairMetrics(),
      get().fetchTechnicianPerformance(),
      get().fetchCashFlow(),
      get().fetchBestSellingProducts(),
    ]);
  },
}));

