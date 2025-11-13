// Dialog for adding new products to inventory

import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { ProductCategory } from '../../pos/types';
import {
  uploadImageToSupabase,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
} from '../utils/image-utils';

type ImageSource = 'url' | 'upload' | 'none';

export function AddProductDialog() {
  const { addProduct } = useInventoryStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>('none');
  
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
    image_url: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 5,
        status: 'active',
        image_url: finalImageUrl || undefined,
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
        image_url: '',
      });
      
      removeImage();
      setOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error al agregar producto',
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa el formulario para agregar un nuevo producto al inventario. Los campos marcados con * son obligatorios.
          </DialogDescription>
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
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium"
              disabled={loading || uploadingImage}
            >
              {uploadingImage ? 'Subiendo imagen...' : loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

