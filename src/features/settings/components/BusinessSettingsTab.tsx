// Business Settings Tab Component

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '../stores/settings-store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export function BusinessSettingsTab() {
  const { businessSettings, loadingBusinessSettings, fetchBusinessSettings, updateBusinessSettings } =
    useSettingsStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_tax_id: '',
    currency: 'USD',
    tax_rate: 0,
    loyalty_points_rate: 1,
    low_stock_threshold: 5,
    default_payment_method: 'cash' as 'cash' | 'card' | 'transfer',
  });

  useEffect(() => {
    fetchBusinessSettings();
  }, [fetchBusinessSettings]);

  useEffect(() => {
    if (businessSettings) {
      setFormData({
        business_name: businessSettings.business_name || '',
        business_address: businessSettings.business_address || '',
        business_phone: businessSettings.business_phone || '',
        business_email: businessSettings.business_email || '',
        business_tax_id: businessSettings.business_tax_id || '',
        currency: businessSettings.currency || 'USD',
        tax_rate: businessSettings.tax_rate || 0,
        loyalty_points_rate: businessSettings.loyalty_points_rate || 1,
        low_stock_threshold: businessSettings.low_stock_threshold || 5,
        default_payment_method: businessSettings.default_payment_method || 'cash',
      });
    }
  }, [businessSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateBusinessSettings(formData);
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han guardado exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingBusinessSettings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Negocio</CardTitle>
        <CardDescription>Información básica y parámetros del negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nombre del Negocio *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_phone">Teléfono</Label>
              <Input
                id="business_phone"
                type="tel"
                value={formData.business_phone}
                onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="business_address">Dirección</Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Email</Label>
              <Input
                id="business_email"
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_tax_id">ID Fiscal / CUIT</Label>
              <Input
                id="business_tax_id"
                value={formData.business_tax_id}
                onChange={(e) => setFormData({ ...formData, business_tax_id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="ARS">ARS ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tasa de Impuesto (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) =>
                  setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyalty_points_rate">Puntos por Dólar</Label>
              <Input
                id="loyalty_points_rate"
                type="number"
                min="0"
                step="0.1"
                value={formData.loyalty_points_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loyalty_points_rate: parseFloat(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Umbral de Stock Bajo</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    low_stock_threshold: parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_payment_method">Método de Pago Predeterminado</Label>
              <Select
                value={formData.default_payment_method}
                onValueChange={(value: 'cash' | 'card' | 'transfer') =>
                  setFormData({ ...formData, default_payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

