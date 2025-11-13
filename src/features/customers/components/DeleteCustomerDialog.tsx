// Delete Customer Dialog Component

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCustomersStore } from '../stores/customers-store';
import { Customer } from '../types';
import { useState } from 'react';

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
}: DeleteCustomerDialogProps) {
  const { deleteCustomer, fetchCustomers } = useCustomersStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      await deleteCustomer(customer._id);
      toast({
        title: 'Cliente eliminado',
        description: `${customer.name} se eliminó correctamente`,
      });
      await fetchCustomers();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error al eliminar cliente',
        description: error.message || 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{' '}
            <strong>{customer.name}</strong> y toda su información asociada.
            {customer.total_orders && customer.total_orders > 0 && (
              <span className="block mt-2 text-destructive">
                ⚠️ Este cliente tiene {customer.total_orders} órdenes asociadas.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

