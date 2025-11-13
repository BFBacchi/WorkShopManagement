import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wrench, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  LogOut,
  Settings,
  Search,
  Loader2,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ThemeSelector } from '@/components/ThemeSelector';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { supabase } from '@/lib/supabase';
import { useRepairsStore } from '@/features/repairs/stores/repairs-store';
import { usePOSStore } from '@/features/pos/stores/pos-store';
import { useInventoryStore } from '@/features/inventory/stores/inventory-store';
import { useCustomersStore } from '@/features/customers/stores/customers-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';

interface DashboardStats {
  totalOrders: number;
  todaySales: number;
  lowStockCount: number;
  totalProducts: number;
  pendingOrders: number;
  totalCustomers: number;
  recentActivity: Array<{
    action: string;
    detail: string;
    time: string;
    color: string;
  }>;
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { orders } = useRepairsStore();
  const { sales, fetchSales } = usePOSStore();
  const { products, getLowStockProducts, getOutOfStockProducts, fetchProducts } = useInventoryStore();
  const { customers, fetchCustomers } = useCustomersStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todaySales: 0,
    lowStockCount: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid]);

  useEffect(() => {
    // Update stats when data changes
    if (user?.uid) {
      updateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length, sales.length, customers.length, products.length, user?.uid]);

  const loadDashboardData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // Load repairs data
      const { data: ordersData } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersData) {
        useRepairsStore.getState().setOrders(
          ordersData.map((item: any) => ({
            _uid: item.user_id,
            _id: item.id,
            order_number: item.order_number,
            customer_id: item.customer_id,
            customer_name: item.customer_name,
            customer_phone: item.customer_phone,
            device_brand: item.device_brand,
            device_model: item.device_model,
            device_imei: item.device_imei,
            device_password: item.device_password,
            reported_issue: item.reported_issue,
            diagnosis: item.diagnosis,
            estimated_cost: item.estimated_cost,
            final_cost: item.final_cost,
            status: item.status,
            assigned_technician: item.assigned_technician,
            priority: item.priority,
            photos: item.photos,
            notes: item.notes,
            created_at: item.created_at,
            updated_at: item.updated_at,
            estimated_delivery: item.estimated_delivery,
            delivered_at: item.delivered_at,
          }))
        );
      }

      // Load sales data
      await fetchSales(100);

      // Load inventory data
      await fetchProducts();

      // Load customers data
      await fetchCustomers();

      // Load recent activity
      await loadRecentActivity();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    if (!user?.uid) return;

    try {
      const activities: Array<{
        action: string;
        detail: string;
        time: string;
        color: string;
        timestamp: number;
      }> = [];

      // Get recent repair orders
      const { data: recentOrders } = await supabase
        .from('repair_orders')
        .select('order_number, customer_name, device_brand, device_model, created_at, status')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrders) {
        recentOrders.forEach((order: any) => {
          const createdAt = new Date(order.created_at);
          const timeAgo = getTimeAgo(createdAt);
          activities.push({
            action: order.status === 'delivered' 
              ? 'Orden entregada' 
              : order.status === 'finished'
              ? 'Orden finalizada'
              : 'Nueva orden de reparación',
            detail: `${order.device_brand} ${order.device_model} - ${order.customer_name}`,
            time: timeAgo,
            color: 'repairs',
            timestamp: createdAt.getTime(),
          });
        });
      }

      // Get recent sales
      const { data: recentSales } = await supabase
        .from('sales')
        .select('sale_number, customer_name, items, total, created_at')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSales) {
        recentSales.forEach((sale: any) => {
          const items = JSON.parse(sale.items || '[]');
          const itemNames = items.slice(0, 2).map((item: any) => item.product.name).join(', ');
          const createdAt = new Date(sale.created_at);
          const timeAgo = getTimeAgo(createdAt);
          activities.push({
            action: 'Venta registrada',
            detail: itemNames + (items.length > 2 ? '...' : ''),
            time: timeAgo,
            color: 'sales',
            timestamp: createdAt.getTime(),
          });
        });
      }

      // Sort by timestamp (most recent first) and take most recent 5
      activities.sort((a, b) => b.timestamp - a.timestamp);

      setStats((prev) => ({
        ...prev,
        recentActivity: activities.slice(0, 5).map(({ timestamp, ...rest }) => rest),
      }));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  const updateStats = () => {
    if (!user?.uid) return;

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales
      .filter((sale) => {
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    // Calculate pending orders (not delivered or cancelled)
    const pendingOrders = orders.filter(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled'
    ).length;

    // Calculate low stock count
    const lowStockProducts = getLowStockProducts();
    const outOfStockProducts = getOutOfStockProducts();
    const lowStockCount = lowStockProducts.length + outOfStockProducts.length;

    // Calculate total products
    const totalProducts = products.filter(p => p.status === 'active').length;

    setStats((prev) => ({
      ...prev,
      totalOrders: orders.length,
      todaySales,
      lowStockCount,
      totalProducts,
      pendingOrders,
      totalCustomers: customers.length,
      recentActivity: prev.recentActivity, // Keep existing activity
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const modules = [
    {
      id: 'repairs',
      title: 'Reparaciones',
      description: 'Órdenes de servicio técnico',
      icon: Wrench,
      color: 'repairs',
      path: '/repairs',
      stats: { 
        label: 'Activas', 
        value: stats.pendingOrders.toString() 
      }
    },
    {
      id: 'pos',
      title: 'Punto de Venta',
      description: 'Ventas y facturación',
      icon: ShoppingCart,
      color: 'sales',
      path: '/pos',
      stats: { 
        label: 'Hoy', 
        value: formatCurrency(stats.todaySales) 
      }
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Stock y repuestos',
      icon: Package,
      color: 'inventory',
      path: '/inventory',
      stats: { 
        label: 'Alertas', 
        value: stats.lowStockCount.toString() 
      }
    },
    {
      id: 'analytics',
      title: 'Analíticas',
      description: 'Reportes y métricas',
      icon: BarChart3,
      color: 'analytics',
      path: '/analytics',
      stats: { 
        label: 'Total órdenes', 
        value: stats.totalOrders.toString() 
      }
    },
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Gestión de clientes',
      icon: Users,
      color: 'customers',
      path: '/customers',
      stats: { 
        label: 'Total', 
        value: stats.totalCustomers.toString() 
      }
    },
    {
      id: 'backoffice',
      title: 'Backoffice',
      description: 'Gestión de sucursales y empleados',
      icon: Building2,
      color: 'analytics',
      path: '/backoffice',
      stats: { 
        label: 'Admin', 
        value: 'Panel' 
      }
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Taller Pro</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar órdenes, clientes, productos..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSelector />
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Bienvenido, {user?.name || user?.email.split('@')[0]}
          </h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-sm text-muted-foreground">Órdenes totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[hsl(var(--sales))]">
                  {formatCurrency(stats.todaySales)}
                </div>
                <p className="text-sm text-muted-foreground">Ventas hoy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[hsl(var(--inventory))]">
                  {stats.totalProducts}
                </div>
                <p className="text-sm text-muted-foreground">Artículos en inventario</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[hsl(var(--repairs))]">
                  {stats.pendingOrders}
                </div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onClick={() => navigate(module.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center module-${module.color} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{module.stats.value}</div>
                      <div className="text-xs text-muted-foreground">{module.stats.label}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.path);
                    }}
                  >
                    Abrir módulo →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full bg-[hsl(var(--${activity.color}))] mt-2`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
