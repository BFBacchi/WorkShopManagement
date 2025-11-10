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
  Bell,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
      stats: { label: 'Activas', value: '12' }
    },
    {
      id: 'pos',
      title: 'Punto de Venta',
      description: 'Ventas y facturación',
      icon: ShoppingCart,
      color: 'sales',
      path: '/pos',
      stats: { label: 'Hoy', value: '$2,450' }
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Stock y repuestos',
      icon: Package,
      color: 'inventory',
      path: '/inventory',
      stats: { label: 'Alertas', value: '5' }
    },
    {
      id: 'analytics',
      title: 'Analíticas',
      description: 'Reportes y métricas',
      icon: BarChart3,
      color: 'analytics',
      path: '/analytics',
      stats: { label: 'Esta semana', value: '+18%' }
    },
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Gestión de clientes',
      icon: Users,
      color: 'customers',
      path: '/customers',
      stats: { label: 'Total', value: '342' }
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">32</div>
              <p className="text-sm text-muted-foreground">Órdenes totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[hsl(var(--sales))]">$8,420</div>
              <p className="text-sm text-muted-foreground">Ventas hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[hsl(var(--inventory))]">5</div>
              <p className="text-sm text-muted-foreground">Stock bajo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[hsl(var(--repairs))]">12</div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

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
              <div className="space-y-4">
                {[
                  { action: 'Nueva orden de reparación', detail: 'iPhone 12 - Cambio de pantalla', time: 'Hace 5 min', color: 'repairs' },
                  { action: 'Venta registrada', detail: 'Funda Samsung A54 x2', time: 'Hace 15 min', color: 'sales' },
                  { action: 'Stock actualizado', detail: 'Pantallas iPhone 11 +10 unidades', time: 'Hace 1 hora', color: 'inventory' },
                ].map((activity, index) => (
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
