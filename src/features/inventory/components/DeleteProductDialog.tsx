// Dialog for confirming product deletion

import { useState } from 'react';
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
import { useInventoryStore } from '../stores/inventory-store';
import type { Product } from '../../pos/types';

interface DeleteProductDialogProps {
  product: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteProductDialog({ product, open: controlledOpen, onOpenChange }: DeleteProductDialogProps) {
  const { deleteProduct } = useInventoryStore();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(product._id);
      toast({
        title: 'Producto eliminado',
        description: `${product.name} se eliminó correctamente`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error al eliminar producto',
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto{' '}
            <strong>{product.name}</strong> y toda su información asociada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
