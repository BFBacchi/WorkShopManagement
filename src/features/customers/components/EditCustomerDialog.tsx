// Edit Customer Dialog Component

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCustomersStore } from '../stores/customers-store';
import { Customer } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false);
  const { updateCustomer, fetchCustomers } = useCustomersStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address || '',
    loyalty_points: customer.loyalty_points || 0,
    rating: customer.rating || 1,
    status: customer.status || 'active',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        loyalty_points: customer.loyalty_points || 0,
        rating: customer.rating || 1,
        status: customer.status || 'active',
      });
    }
  }, [customer, open]);

  const ratingCategories: Record<number, string> = {
    1: '⭐ Muy Bajo - Cliente problemático',
    2: '⭐⭐ Bajo - Cliente difícil',
    3: '⭐⭐⭐ Regular - Cliente promedio',
    4: '⭐⭐⭐⭐ Bueno - Cliente confiable',
    5: '⭐⭐⭐⭐⭐ Excelente - Cliente VIP',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.phone) {
        toast({
          title: 'Error',
          description: 'Nombre y teléfono son requeridos',
          variant: 'destructive',
        });
        return;
      }

      await updateCustomer(customer._id, {
        ...formData,
        loyalty_points: formData.loyalty_points || 0,
        rating: formData.rating || 1,
        status: formData.status || 'active',
      });
      toast({
        title: 'Cliente actualizado',
        description: `${formData.name} ha sido actualizado exitosamente`,
      });
      await fetchCustomers();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Modifica la información del cliente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 9 11 1234-5678"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, número, ciudad..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-loyalty-points">Puntos de Lealtad</Label>
              <Input
                id="edit-loyalty-points"
                type="number"
                min="0"
                value={formData.loyalty_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loyalty_points: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Puntos actuales del programa de lealtad
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-rating">Calificación del Cliente</Label>
              <Select
                value={formData.rating?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, rating: parseInt(value) })
                }
              >
                <SelectTrigger id="edit-rating">
                  <SelectValue placeholder="Selecciona una calificación" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {ratingCategories[rating]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (formData.rating || 1)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="edit-status">Estado del Cliente</Label>
                <p className="text-xs text-muted-foreground">
                  {formData.status === 'active'
                    ? 'Cliente activo en el sistema'
                    : 'Cliente inactivo (no aparecerá en búsquedas)'}
                </p>
              </div>
              <Switch
                id="edit-status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    status: checked ? 'active' : 'inactive',
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

