// Alerts Widget Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  type: 'low_stock' | 'overdue' | 'low_revenue' | 'high_expense';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.uid) {
      loadAlerts();
    }
  }, [user?.uid]);

  const loadAlerts = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const newAlerts: Alert[] = [];

    try {
      // Check low stock products
      const { data: products } = await supabase
        .from('products')
        .select('name, stock, min_stock')
        .eq('status', 'active');

      if (products) {
        products.forEach((product: any) => {
          if (product.stock <= product.min_stock) {
            newAlerts.push({
              id: `stock-${product.name}`,
              type: 'low_stock',
              title: 'Stock Bajo',
              message: `${product.name} tiene solo ${product.stock} unidades (mínimo: ${product.min_stock})`,
              severity: product.stock === 0 ? 'high' : 'medium',
            });
          }
        });
      }

      // Check overdue repair orders
      const { data: orders } = await supabase
        .from('repair_orders')
        .select('order_number, estimated_delivery, status')
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
              newAlerts.push({
                id: `overdue-${order.order_number}`,
                type: 'overdue',
                title: 'Orden Atrasada',
                message: `Orden ${order.order_number} está ${daysOverdue} días atrasada`,
                severity: daysOverdue > 7 ? 'high' : 'medium',
              });
            }
          }
        });
      }

      // Check today's sales (low revenue alert)
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
          newAlerts.push({
            id: 'low-revenue-today',
            type: 'low_revenue',
            title: 'Ventas Bajas Hoy',
            message: `Las ventas de hoy son ${totalRevenue.toFixed(2)} (umbral: $100)`,
            severity: 'low',
          });
        }
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
      setAlerts(newAlerts);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="h-4 w-4" />;
      case 'overdue':
        return <Clock className="h-4 w-4" />;
      case 'low_revenue':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas
        </CardTitle>
        <CardDescription>Notificaciones y alertas del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay alertas activas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

