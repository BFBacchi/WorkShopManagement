import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryCatalog } from '@/features/inventory/components/InventoryCatalog';
import { AddProductDialog } from '@/features/inventory/components/AddProductDialog';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function InventoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Control de stock y repuestos</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <AddProductDialog />
          </div>
        </div>

        <InventoryCatalog />
      </div>
    </div>
  );
}
