// Point of Sale page - Touch-optimized sales interface

import { useEffect } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOSStore } from '@/features/pos/stores/pos-store';
import { ProductCatalog } from '@/features/pos/components/ProductCatalog';
import { ShoppingCart } from '@/features/pos/components/ShoppingCart';
import { AddProductDialog } from '@/features/pos/components/AddProductDialog';
import { CashRegisterClosure } from '@/features/pos/components/CashRegisterClosure';

export default function POSPage() {
  const { fetchProducts, products, cart } = usePOSStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-pos-green/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-pos-green" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Punto de Venta</h1>
              <p className="text-muted-foreground">Sistema POS para ventas rápidas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CashRegisterClosure />
            <AddProductDialog />
          </div>
        </div>
        
        {/* Main Layout */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No hay productos</h2>
            <p className="text-muted-foreground mb-6">
              Agrega productos para comenzar a vender
            </p>
            <AddProductDialog />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,400px] gap-6">
            {/* Left: Product Catalog */}
            <div>
              <ProductCatalog />
            </div>
            
            {/* Right: Shopping Cart */}
            <div className="lg:sticky lg:top-6 h-fit">
              <ShoppingCart />
            </div>
          </div>
        )}
        
        {/* Cart Summary for Mobile (Fixed Bottom) */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
            <Button
              size="lg"
              className="w-full bg-pos-green hover:bg-pos-green/90 text-white h-14 text-lg font-semibold touch-manipulation"
              onClick={() => {
                const cartElement = document.querySelector('[data-cart]');
                cartElement?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver Carrito ({cart.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
