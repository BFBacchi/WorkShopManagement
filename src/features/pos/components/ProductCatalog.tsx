// Product catalog for POS with touch-optimized interface

import { useState, useMemo, useEffect } from 'react';
import { Search, Package, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { usePOSStore } from '../stores/pos-store';
import { formatCurrency, getCategoryColor, hasLowStock } from '../utils/pos-utils';
import type { Product, ProductCategory } from '../types';

type ViewMode = 'cards' | 'list';

export function ProductCatalog() {
  const { products, loadingProducts, addToCart } = usePOSStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('pos-view-mode');
    return (saved === 'list' || saved === 'cards') ? saved : 'cards';
  });

  useEffect(() => {
    localStorage.setItem('pos-view-mode', viewMode);
  }, [viewMode]);
  
  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery);
      
      const matchesCategory = 
        categoryFilter === 'all' || product.category === categoryFilter;
      
      const isActive = product.status === 'active';
      
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchQuery, categoryFilter]);
  
  const categories: { value: ProductCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'device', label: 'Equipos' },
    { value: 'accessory', label: 'Accesorios' },
    { value: 'part', label: 'Refacciones' },
  ];
  
  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-pos-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, SKU, marca o código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('cards')}
              className="h-10 w-10"
              title="Vista de tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-10 w-10"
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat.value)}
              className="whitespace-nowrap min-w-[100px] h-10 touch-manipulation"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No se encontraron productos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Intenta con otro término de búsqueda
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map(product => (
            <ProductListItem
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const lowStock = hasLowStock(product.stock, product.min_stock);
  const outOfStock = product.stock === 0;
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer touch-manipulation ${
        outOfStock ? 'opacity-60' : ''
      }`}
      onClick={() => !outOfStock && onAddToCart(product)}
    >
      <div className="aspect-square bg-muted relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${getCategoryColor(product.category)} text-xs`}>
            {product.category === 'device' && 'Equipo'}
            {product.category === 'accessory' && 'Accesorio'}
            {product.category === 'part' && 'Refacción'}
          </Badge>
        </div>
        
        {/* Stock Alert */}
        {lowStock && !outOfStock && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Bajo
            </Badge>
          </div>
        )}
        
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-semibold">
              Agotado
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        <div>
          <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </p>
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-pos-green">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            Stock: {product.stock}
          </p>
        </div>
      </div>
    </Card>
  );
}

function ProductListItem({ product, onAddToCart }: ProductCardProps) {
  const lowStock = hasLowStock(product.stock, product.min_stock);
  const outOfStock = product.stock === 0;
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer touch-manipulation ${
        outOfStock ? 'opacity-60' : ''
      }`}
      onClick={() => !outOfStock && onAddToCart(product)}
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Stock Alert */}
          {lowStock && !outOfStock && (
            <div className="absolute top-1 left-1">
              <Badge variant="destructive" className="text-xs px-1 py-0">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                Bajo
              </Badge>
            </div>
          )}
          
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Agotado
              </Badge>
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-base truncate">
                  {product.name}
                </p>
                <Badge className={`${getCategoryColor(product.category)} text-xs`}>
                  {product.category === 'device' && 'Equipo'}
                  {product.category === 'accessory' && 'Accesorio'}
                  {product.category === 'part' && 'Refacción'}
                </Badge>
              </div>
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
              )}
              {product.sku && (
                <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <p className="text-xl font-bold text-pos-green">
                {formatCurrency(product.price)}
              </p>
              <p className={`text-sm font-medium ${
                outOfStock ? 'text-red-600' : 
                lowStock ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                Stock: {product.stock}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
