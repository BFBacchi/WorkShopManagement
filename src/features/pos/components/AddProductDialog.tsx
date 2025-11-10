// Dialog for adding new products to inventory

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePOSStore } from '../stores/pos-store';
import type { ProductCategory } from '../types';

export function AddProductDialog() {
  const { addProduct } = usePOSStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'device' as ProductCategory,
    subcategory: '',
    brand: '',
    model: '',
    sku: '',
    barcode: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '',
    description: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      toast({
        title: 'Campos requeridos',
        description: 'Completa nombre, SKU, precio y stock',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await addProduct({
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        model: formData.model || undefined,
        sku: formData.sku,
        barcode: formData.barcode || undefined,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock),
        min_stock: parseInt(formData.min_stock) || 5,
        status: 'active',
        description: formData.description || undefined,
      });
      
      toast({
        title: 'Producto agregado',
        description: `${formData.name} se agregó al inventario`,
      });
      
      // Reset form
      setFormData({
        name: '',
        category: 'device',
        subcategory: '',
        brand: '',
        model: '',
        sku: '',
        barcode: '',
        price: '',
        cost: '',
        stock: '',
        min_stock: '',
        description: '',
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error al agregar producto',
        description: 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pos-green hover:bg-pos-green/90 text-white font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 15 Pro Max 256GB"
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ProductCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="device">Equipo</SelectItem>
                  <SelectItem value="accessory">Accesorio</SelectItem>
                  <SelectItem value="part">Refacción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Subcategory */}
            <div>
              <Label htmlFor="subcategory">Subcategoría</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Smartphone, Funda, Pantalla..."
              />
            </div>
            
            {/* Brand */}
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Apple, Samsung, Xiaomi..."
              />
            </div>
            
            {/* Model */}
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="A2893, SM-G991B..."
              />
            </div>
            
            {/* SKU */}
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="IP15PM-256-BLK"
                required
              />
            </div>
            
            {/* Barcode */}
            <div>
              <Label htmlFor="barcode">Código de barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="7501234567890"
              />
            </div>
            
            {/* Price */}
            <div>
              <Label htmlFor="price">Precio de venta *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            
            {/* Cost */}
            <div>
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock inicial *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            
            {/* Min Stock */}
            <div>
              <Label htmlFor="min_stock">Stock mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="5"
              />
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Características adicionales del producto..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-pos-green hover:bg-pos-green/90"
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
