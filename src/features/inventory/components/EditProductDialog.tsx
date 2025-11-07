// Dialog for editing products

import { useState, useEffect, useRef } from 'react';
import { Pencil, X } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useInventoryStore } from '../stores/inventory-store';
import type { Product, ProductCategory } from '../../pos/types';
import {
  uploadImageToSupabase,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
} from '../utils/image-utils';

type ImageSource = 'url' | 'upload' | 'none';

interface EditProductDialogProps {
  product: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditProductDialog({ product, open: controlledOpen, onOpenChange }: EditProductDialogProps) {
  const { updateProduct } = useInventoryStore();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>('none');
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    model: product.model || '',
    sku: product.sku,
    barcode: product.barcode || '',
    price: product.price.toString(),
    cost: product.cost.toString(),
    stock: product.stock.toString(),
    min_stock: product.min_stock.toString(),
    status: product.status,
    description: product.description || '',
    image_url: product.image_url || '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Load product data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        model: product.model || '',
        sku: product.sku,
        barcode: product.barcode || '',
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
        status: product.status,
        description: product.description || '',
        image_url: product.image_url || '',
      });
      
      if (product.image_url) {
        setImagePreview(product.image_url);
        setImageSource('url');
      } else {
        setImagePreview(null);
        setImageSource('none');
      }
      setSelectedFile(null);
    }
  }, [open, product]);
  
  // Cleanup preview when dialog closes
  useEffect(() => {
    if (!open) {
      if (imagePreview && imageSource === 'upload') {
        revokeImagePreview(imagePreview);
      }
      setImagePreview(null);
      setSelectedFile(null);
      setImageSource('none');
    }
  }, [open, imagePreview, imageSource]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      validateImageFile(file);
      setSelectedFile(file);
      const preview = createImagePreview(file);
      setImagePreview(preview);
      setImageSource('upload');
    } catch (error) {
      toast({
        title: 'Error en archivo',
        description: error instanceof Error ? error.message : 'Archivo inválido',
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    if (url) {
      setImagePreview(url);
      setImageSource('url');
    } else {
      setImagePreview(null);
      setImageSource('none');
    }
  };
  
  const removeImage = () => {
    if (imagePreview && imageSource === 'upload') {
      revokeImagePreview(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setFormData({ ...formData, image_url: '' });
    setImageSource('none');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.price || formData.stock === '') {
      toast({
        title: 'Campos requeridos',
        description: 'Completa nombre, SKU, precio y stock',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    let finalImageUrl = formData.image_url;
    
    try {
      // Upload image to Supabase if file was selected
      if (selectedFile && imageSource === 'upload') {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadImageToSupabase(selectedFile);
          toast({
            title: 'Imagen subida',
            description: 'La imagen se subió correctamente',
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: 'Error al subir imagen',
            description: error instanceof Error ? error.message : 'Intenta nuevamente',
            variant: 'destructive',
          });
          setUploadingImage(false);
          setLoading(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      
      await updateProduct({
        ...product,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        model: formData.model || undefined,
        sku: formData.sku,
        barcode: formData.barcode || undefined,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 5,
        status: formData.status,
        image_url: finalImageUrl || undefined,
        description: formData.description || undefined,
      });
      
      toast({
        title: 'Producto actualizado',
        description: `${formData.name} se actualizó correctamente`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error al actualizar producto',
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 15 Pro Max 256GB"
                required
              />
            </div>
            
            {/* Image Section */}
            <div className="col-span-2 space-y-2">
              <Label>Imagen del Producto</Label>
              <Tabs value={imageSource} onValueChange={(v) => {
                if (v === 'none') {
                  removeImage();
                } else {
                  setImageSource(v as ImageSource);
                }
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="none">Sin imagen</TabsTrigger>
                  <TabsTrigger value="url">Desde URL</TabsTrigger>
                  <TabsTrigger value="upload">Subir archivo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={formData.image_url}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos permitidos: JPG, PNG, WEBP, GIF. Máximo 5MB
                  </p>
                </TabsContent>
              </Tabs>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-2">
                  <div className="relative w-full max-w-xs aspect-square border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Category */}
            <div>
              <Label htmlFor="edit-category">Categoría *</Label>
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
            
            {/* Status */}
            <div>
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Product['status'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Subcategory */}
            <div>
              <Label htmlFor="edit-subcategory">Subcategoría</Label>
              <Input
                id="edit-subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Smartphone, Funda, Pantalla..."
              />
            </div>
            
            {/* Brand */}
            <div>
              <Label htmlFor="edit-brand">Marca</Label>
              <Input
                id="edit-brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Apple, Samsung, Xiaomi..."
              />
            </div>
            
            {/* Model */}
            <div>
              <Label htmlFor="edit-model">Modelo</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="A2893, SM-G991B..."
              />
            </div>
            
            {/* SKU */}
            <div>
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="IP15PM-256-BLK"
                required
              />
            </div>
            
            {/* Barcode */}
            <div>
              <Label htmlFor="edit-barcode">Código de barras</Label>
              <Input
                id="edit-barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="7501234567890"
              />
            </div>
            
            {/* Price */}
            <div>
              <Label htmlFor="edit-price">Precio de venta *</Label>
              <Input
                id="edit-price"
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
              <Label htmlFor="edit-cost">Costo</Label>
              <Input
                id="edit-cost"
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
              <Label htmlFor="edit-stock">Stock *</Label>
              <Input
                id="edit-stock"
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
              <Label htmlFor="edit-min_stock">Stock mínimo</Label>
              <Input
                id="edit-min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="5"
              />
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
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
              className="module-inventory"
              disabled={loading || uploadingImage}
            >
              {uploadingImage ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

