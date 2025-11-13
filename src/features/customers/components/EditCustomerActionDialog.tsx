// Edit Customer Action Dialog Component

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useCustomersStore } from '../stores/customers-store';
import { CustomerAction } from '../types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditCustomerActionDialogProps {
  action: CustomerAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerActionDialog({
  action,
  open,
  onOpenChange,
}: EditCustomerActionDialogProps) {
  const { updateCustomerAction, fetchCustomerActions } = useCustomersStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerAction>>({
    action_type: action.action_type,
    title: action.title,
    description: action.description,
    action_date: action.action_date,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        action_type: action.action_type,
        title: action.title,
        description: action.description,
        action_date: action.action_date,
      });
    }
  }, [action, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast({
        title: 'Error',
        description: 'El título es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await updateCustomerAction(action.id, formData);
      await fetchCustomerActions(action.customer_id);
      toast({
        title: 'Acción actualizada',
        description: 'La acción se ha actualizado correctamente',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la acción',
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
          <DialogTitle>Editar Acción</DialogTitle>
          <DialogDescription>
            Modifica la información de la acción
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action_type">Tipo de Acción *</Label>
              <Select
                value={formData.action_type}
                onValueChange={(value: CustomerAction['action_type']) =>
                  setFormData({ ...formData, action_type: value })
                }
              >
                <SelectTrigger id="action_type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Nota</SelectItem>
                  <SelectItem value="call">Llamada</SelectItem>
                  <SelectItem value="visit">Visita</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="task">Tarea</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Llamada de seguimiento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalles de la acción..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action_date">Fecha</Label>
              <Input
                id="action_date"
                type="datetime-local"
                value={
                  formData.action_date
                    ? new Date(formData.action_date).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    action_date: new Date(e.target.value).toISOString(),
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

