// Customer Profile Page

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Phone, Mail, MapPin, Star, Wrench, ShoppingCart, Calendar } from 'lucide-react';
import { useCustomersStore } from '@/features/customers/stores/customers-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2 } from 'lucide-react';
import { CustomerHistory } from '@/features/customers/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedCustomer,
    customerHistory,
    loading,
    loadingHistory,
    fetchCustomerById,
    fetchCustomerHistory,
  } = useCustomersStore();

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      fetchCustomerHistory(id);
    }
  }, [id, fetchCustomerById, fetchCustomerHistory]);

  if (loading) {
    return (
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cliente no encontrado</p>
            <Button onClick={() => navigate('/customers')} className="mt-4">
              Volver a Clientes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'repair':
        return <Wrench className="h-4 w-4" />;
      case 'sale':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusColors: Record<string, string> = {
      received: 'default',
      diagnosed: 'default',
      'in_repair': 'default',
      'waiting_parts': 'default',
      finished: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={statusColors[status] as any || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
            <p className="text-muted-foreground">Perfil del cliente</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-semibold">{selectedCustomer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-semibold">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dirección</p>
                        <p className="font-semibold">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Puntos de Lealtad</p>
                      <p className="text-2xl font-bold">{selectedCustomer.loyalty_points || 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastado</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedCustomer.total_spent || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Órdenes</p>
                    <p className="text-2xl font-bold">{selectedCustomer.total_orders || 0}</p>
                  </div>
                  {selectedCustomer.last_visit && (
                    <div>
                      <p className="text-sm text-muted-foreground">Última Visita</p>
                      <p className="font-semibold">
                        {new Date(selectedCustomer.last_visit).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
              <CardDescription>Historial completo de interacciones con el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : customerHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay historial disponible</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerHistory.map((item: CustomerHistory) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getHistoryIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{item.description}</p>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {item.amount && (
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.amount)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

