// Notifications Store

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { Notification, NotificationStats } from '../types';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  stats: NotificationStats;

  // Actions
  fetchNotifications: (limit?: number) => Promise<void>;
  generateDynamicAlerts: () => Promise<Notification[]>;
  generateNotificationsFromAlerts: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: Omit<Notification, '_uid' | '_id' | 'created_at' | 'read'>) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: () => number;
  updateStats: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  // Initial state
  notifications: [],
  loading: false,
  stats: {
    total: 0,
    unread: 0,
    bySeverity: {
      high: 0,
      medium: 0,
      low: 0,
    },
  },

  fetchNotifications: async (limit = 50) => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) throw new Error('Usuario no autenticado');

      // Primero intentar obtener notificaciones de la base de datos
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      let dbNotifications: Notification[] = [];
      
      if (!error && data && data.length > 0) {
        // Si hay notificaciones en la BD, usarlas
        dbNotifications = (data || []).map((item: any) => ({
          _uid: item.user_id,
          _id: item.id,
          type: item.type,
          title: item.title,
          message: item.message,
          severity: item.severity,
          read: item.read || false,
          related_id: item.related_id,
          related_type: item.related_type,
          action_url: item.action_url,
          created_at: item.created_at,
          read_at: item.read_at,
        }));
      }

      // Generar alertas dinámicas (igual que en analíticas)
      const dynamicNotifications = await get().generateDynamicAlerts();
      
      // Combinar y eliminar duplicados (priorizar BD sobre dinámicas)
      const combinedNotifications = [...dbNotifications];
      const dbIds = new Set(dbNotifications.map(n => n._id));
      
      dynamicNotifications.forEach((notif) => {
        if (!dbIds.has(notif._id)) {
          combinedNotifications.push(notif);
        }
      });

      // Ordenar por fecha (más recientes primero)
      combinedNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      set({ notifications: combinedNotifications.slice(0, limit) });
      get().updateStats();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback: solo usar alertas dinámicas
      const dynamicNotifications = await get().generateDynamicAlerts();
      set({ notifications: dynamicNotifications });
      get().updateStats();
    } finally {
      set({ loading: false });
    }
  },

  // Nueva función que retorna las alertas sin actualizar el estado
  generateDynamicAlerts: async (): Promise<Notification[]> => {
    const user = useAuthStore.getState().user;
    if (!user?.uid) return [];

    const notifications: Notification[] = [];

    try {
      // Check low stock products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock, min_stock')
        .eq('status', 'active');

      if (products) {
        products.forEach((product: any) => {
          if (product.stock <= product.min_stock) {
            notifications.push({
              _uid: user.uid,
              _id: `stock-${product.id}`,
              type: 'low_stock',
              title: 'Stock Bajo',
              message: `${product.name} tiene solo ${product.stock} unidades (mínimo: ${product.min_stock})`,
              severity: product.stock === 0 ? 'high' : 'medium',
              read: false,
              related_id: product.id,
              related_type: 'product',
              action_url: '/inventory',
              created_at: new Date().toISOString(),
            });
          }
        });
      }

      // Check overdue repair orders
      const { data: orders } = await supabase
        .from('repair_orders')
        .select('id, order_number, estimated_delivery, status')
        .in('status', ['received', 'diagnosed', 'in_repair', 'waiting_parts', 'finished']);

      if (orders) {
        const today = new Date();
        orders.forEach((order: any) => {
          if (order.estimated_delivery) {
            const deliveryDate = new Date(order.estimated_delivery);
            if (deliveryDate < today) {
              const daysOverdue = Math.floor(
                (today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              notifications.push({
                _uid: user.uid,
                _id: `overdue-${order.id}`,
                type: 'overdue',
                title: 'Orden Atrasada',
                message: `Orden ${order.order_number} está ${daysOverdue} días atrasada`,
                severity: daysOverdue > 7 ? 'high' : 'medium',
                read: false,
                related_id: order.id,
                related_type: 'repair_order',
                action_url: `/repairs`,
                created_at: new Date().toISOString(),
              });
            }
          }
        });
      }

      // Check today's sales (low revenue alert) - igual que en analíticas
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total')
        .gte('sale_date', today)
        .lt('sale_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      if (todaySales) {
        const totalRevenue = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        // Alert if revenue is less than $100 (configurable threshold)
        if (totalRevenue < 100 && todaySales.length > 0) {
          notifications.push({
            _uid: user.uid,
            _id: 'low-revenue-today',
            type: 'low_revenue',
            title: 'Ventas Bajas Hoy',
            message: `Las ventas de hoy son ${totalRevenue.toFixed(2)} (umbral: $100)`,
            severity: 'low',
            read: false,
            related_id: null,
            related_type: 'sales',
            action_url: '/analytics',
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error generating dynamic alerts:', error);
    }

    return notifications;
  },

  // Función legacy que actualiza el estado (mantener para compatibilidad)
  generateNotificationsFromAlerts: async () => {
    const dynamicNotifications = await get().generateDynamicAlerts();
    set({ notifications: dynamicNotifications });
    get().updateStats();
  },

  markAsRead: async (notificationId: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) return;

      // Try to update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        ),
      }));

      get().updateStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) return;

      // Try to update in database
      const { error } = await supabase.rpc('mark_all_notifications_read');

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        // Fallback: update manually
        await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('read', false);
      }

      // Update local state
      const now = new Date().toISOString();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true, read_at: now })),
      }));

      get().updateStats();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  createNotification: async (notificationData) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) return;

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.uid,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          severity: notificationData.severity,
          related_id: notificationData.related_id,
          related_type: notificationData.related_type,
          action_url: notificationData.action_url,
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // Table doesn't exist, just add to local state
          const newNotification: Notification = {
            _uid: user.uid,
            _id: `local-${Date.now()}`,
            ...notificationData,
            read: false,
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
          }));
          get().updateStats();
          return;
        }
        throw error;
      }

      if (data) {
        const newNotification: Notification = {
          _uid: data.user_id,
          _id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          severity: data.severity,
          read: data.read || false,
          related_id: data.related_id,
          related_type: data.related_type,
          action_url: data.action_url,
          created_at: data.created_at,
          read_at: data.read_at,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
        get().updateStats();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.uid) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== notificationId),
      }));

      get().updateStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  updateStats: () => {
    const notifications = get().notifications;
    const unread = notifications.filter((n) => !n.read).length;
    const bySeverity = {
      high: notifications.filter((n) => n.severity === 'high' && !n.read).length,
      medium: notifications.filter((n) => n.severity === 'medium' && !n.read).length,
      low: notifications.filter((n) => n.severity === 'low' && !n.read).length,
    };

    set({
      stats: {
        total: notifications.length,
        unread,
        bySeverity,
      },
    });
  },
}));

