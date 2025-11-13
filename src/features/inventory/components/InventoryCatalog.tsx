// Inventory catalog with advanced filters

import { useEffect, useMemo, useState } from 'react';
import { Search, Package, AlertTriangle, Filter, X, TrendingDown, TrendingUp, MoreVertical, Pencil, Trash2, LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInventoryStore } from '../stores/inventory-store';
import { formatCurrency } from '../../pos/utils/pos-utils';
import type { Product, ProductCategory } from '../../pos/types';
import { EditProductDialog } from './EditProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';

type ViewMode = 'cards' | 'list';

export function InventoryCatalog() {
  const {
    products,
    loadingProducts,
    filters,
    setFilters,
    resetFilters,
    fetchProducts,
    getFilteredProducts,
    getBrands,
    getCategories,
    getLowStockProducts,
    getOutOfStockProducts,
  } = useInventoryStore();
  
  const brands = getBrands();
  const categories = getCategories();
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('inventory-view-mode');
    return (saved === 'list' || saved === 'cards') ? saved : 'cards';
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    localStorage.setItem('inventory-view-mode', viewMode);
  }, [viewMode]);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const filteredProducts = getFilteredProducts();
  
  const categoryOptions: { value: ProductCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'device', label: 'Equipos' },
    { value: 'accessory', label: 'Accesorios' },
    { value: 'part', label: 'Refacciones' },
  ];
  
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'discontinued', label: 'Descontinuados' },
  ];
  
  const stockStatusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'in_stock', label: 'En Stock' },
    { value: 'low_stock', label: 'Stock Bajo' },
    { value: 'out_of_stock', label: 'Sin Stock' },
  ];
  
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.brand !== 'all' ||
    filters.status !== 'all' ||
    filters.stockStatus !== 'all' ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;
  
  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Alerts for low stock */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-2">
          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  {outOfStockProducts.length} producto(s) sin stock
                </span>
              </CardContent>
            </Card>
          )}
          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-3 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  {lowStockProducts.length} producto(s) con stock bajo
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, SKU, marca o modelo..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtros Avanzados</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter(v => 
                  v !== '' && v !== 'all' && v !== undefined
                ).length}
              </Badge>
            )}
          </div>
          {showFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Filtros Avanzados</h3>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Brand Filter */}
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={filters.brand}
                onValueChange={(value) => setFilters({ brand: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Stock Status Filter */}
            <div className="space-y-2">
              <Label>Stock</Label>
              <Select
                value={filters.stockStatus}
                onValueChange={(value) => setFilters({ stockStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stockStatusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Mínimo</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ 
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio Máximo</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ 
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      )}
      
      {/* Results Count and View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary">
              Filtros activos
            </Badge>
          )}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('cards')}
              className="h-8 w-8"
              title="Vista de tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No se encontraron productos
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros' 
                : 'Agrega productos para comenzar'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map(product => (
            <ProductListItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const isLowStock = product.stock > 0 && product.stock <= product.min_stock;
  const isOutOfStock = product.stock === 0;
  
  const getStockBadge = () => {
    if (isOutOfStock) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    }
    if (isLowStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">Stock Bajo</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">En Stock</Badge>;
  };
  
  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case 'device':
        return 'bg-blue-100 text-blue-800';
      case 'accessory':
        return 'bg-purple-100 text-purple-800';
      case 'part':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            </div>
            <div className="flex items-center gap-1">
              {getStockBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Image placeholder */}
          {product.image_url ? (
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-mono">{product.sku}</span>
            </div>
            
            {product.model && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Modelo:</span>
                <span>{product.model}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Precio:</span>
              <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock:</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  isOutOfStock ? 'text-red-600' : 
                  isLowStock ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {product.stock}
                </span>
                {product.min_stock > 0 && (
                  <span className="text-xs text-muted-foreground">
                    / Mín: {product.min_stock}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary" className={getCategoryColor(product.category)}>
                {product.category === 'device' ? 'Equipo' : 
                 product.category === 'accessory' ? 'Accesorio' : 'Refacción'}
              </Badge>
              {product.status !== 'active' && (
                <Badge variant="outline" className="text-xs">
                  {product.status === 'inactive' ? 'Inactivo' : 'Descontinuado'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      {showEditDialog && (
        <EditProductDialog 
          product={product} 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
      {showDeleteDialog && (
        <DeleteProductDialog 
          product={product}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const isLowStock = product.stock > 0 && product.stock <= product.min_stock;
  const isOutOfStock = product.stock === 0;
  
  const getStockBadge = () => {
    if (isOutOfStock) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    }
    if (isLowStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">Stock Bajo</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">En Stock</Badge>;
  };
  
  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case 'device':
        return 'bg-blue-100 text-blue-800';
      case 'accessory':
        return 'bg-purple-100 text-purple-800';
      case 'part':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
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
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <Badge className={`${getCategoryColor(product.category)} text-xs`}>
                      {product.category === 'device' ? 'Equipo' : 
                       product.category === 'accessory' ? 'Accesorio' : 'Refacción'}
                    </Badge>
                    {getStockBadge()}
                  </div>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {product.sku && (
                      <span className="font-mono">SKU: {product.sku}</span>
                    )}
                    {product.model && (
                      <span>Modelo: {product.model}</span>
                    )}
                    {product.min_stock > 0 && (
                      <span>Mín: {product.min_stock}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-semibold mb-1">
                      {formatCurrency(product.price)}
                    </div>
                    <div className={`text-sm font-medium ${
                      isOutOfStock ? 'text-red-600' : 
                      isLowStock ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      Stock: {product.stock}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      {showEditDialog && (
        <EditProductDialog 
          product={product} 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
      {showDeleteDialog && (
        <DeleteProductDialog 
          product={product}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}

