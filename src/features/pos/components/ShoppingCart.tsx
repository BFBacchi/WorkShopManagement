// Shopping cart component with checkout functionality

import { useState } from 'react';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, Percent, DollarSign, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePOSStore } from '../stores/pos-store';
import { formatCurrency } from '../utils/pos-utils';
import { CheckoutDialog } from './CheckoutDialog';

export function ShoppingCart() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    discountType,
    discountValue,
    setDiscount,
    customerName,
    customerPhone,
    setCustomerInfo,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
  } = usePOSStore();
  
  const [showCheckout, setShowCheckout] = useState(false);
  
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const total = getCartTotal();
  
  if (cart.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <CartIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Carrito vacío
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona productos para comenzar
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="p-4 space-y-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5 text-pos-green" />
            <h3 className="font-semibold">Carrito ({cart.length})</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
        
        <Separator />
        
        {/* Cart Items */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {cart.map(item => (
            <div key={item.product._id} className="space-y-2">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded flex-shrink-0">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CartIcon className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-pos-green font-semibold">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.product._id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-12 text-center font-medium">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                    className="h-8 w-8 p-0 touch-manipulation"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="font-semibold">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <Separator />
        
        {/* Discount Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Descuento</Label>
          <div className="flex gap-2">
            <Select
              value={discountType}
              onValueChange={(value) => setDiscount(value as any, discountValue)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin descuento</SelectItem>
                <SelectItem value="percentage">Porcentaje</SelectItem>
                <SelectItem value="fixed">Monto fijo</SelectItem>
              </SelectContent>
            </Select>
            
            {discountType !== 'none' && (
              <div className="flex-1 relative">
                {discountType === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="number"
                  placeholder="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscount(discountType, parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  min="0"
                  max={discountType === 'percentage' ? 100 : subtotal}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cliente (Opcional)</Label>
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerInfo(e.target.value, customerPhone)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Teléfono"
                value={customerPhone}
                onChange={(e) => setCustomerInfo(customerName, e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Descuento</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-pos-green">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        
        {/* Checkout Button */}
        <Button
          size="lg"
          className="w-full bg-pos-green hover:bg-pos-green/90 text-white h-14 text-lg font-semibold touch-manipulation"
          onClick={() => setShowCheckout(true)}
        >
          Procesar Pago
        </Button>
      </Card>
      
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
}
