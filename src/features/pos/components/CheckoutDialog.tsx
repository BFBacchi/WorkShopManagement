// Checkout dialog with payment methods

import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePOSStore } from '../stores/pos-store';
import { formatCurrency } from '../utils/pos-utils';
import { ReceiptDialog } from './ReceiptDialog';
import type { PaymentMethod, PaymentDetail, Sale } from '../types';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { completeSale, getCartTotal } = usePOSStore();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const total = getCartTotal();
  const change = cashReceived - total;
  
  const paymentMethods: { value: PaymentMethod; label: string; icon: any }[] = [
    { value: 'cash', label: 'Efectivo', icon: Banknote },
    { value: 'card', label: 'Tarjeta', icon: CreditCard },
    { value: 'transfer', label: 'Transferencia', icon: Smartphone },
  ];
  
  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Selecciona un método de pago',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedMethod === 'cash' && cashReceived < total) {
      toast({
        title: 'Monto insuficiente',
        description: 'El efectivo recibido debe ser mayor o igual al total',
        variant: 'destructive',
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      const sale = await completeSale(selectedMethod);
      
      if (sale) {
        toast({
          title: 'Venta completada',
          description: `Venta ${sale.sale_number} registrada exitosamente`,
        });
        
        // Show receipt
        setCompletedSale(sale);
        setShowReceipt(true);
        
        // Reset and close checkout
        setSelectedMethod(null);
        setCashReceived(0);
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error al procesar venta',
        description: 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Procesar Pago</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Total Display */}
          <div className="bg-pos-green/10 border-2 border-pos-green rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
            <p className="text-3xl font-bold text-pos-green">
              {formatCurrency(total)}
            </p>
          </div>
          
          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Método de pago</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;
                
                return (
                  <Button
                    key={method.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-20 flex flex-col gap-2 touch-manipulation ${
                      isSelected ? 'bg-pos-green hover:bg-pos-green/90' : ''
                    }`}
                    onClick={() => setSelectedMethod(method.value)}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs">{method.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Cash Input */}
          {selectedMethod === 'cash' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cash-received">Efectivo recibido</Label>
                <Input
                  id="cash-received"
                  type="number"
                  placeholder="0.00"
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="text-lg h-12"
                  autoFocus
                  step="0.01"
                  min="0"
                />
              </div>
              
              {cashReceived > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recibido</span>
                    <span className="font-medium">{formatCurrency(cashReceived)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Cambio</span>
                    <span className={`font-bold text-lg ${
                      change >= 0 ? 'text-pos-green' : 'text-destructive'
                    }`}>
                      {formatCurrency(Math.max(0, change))}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setCashReceived(amount)}
                    className="touch-manipulation"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </>
          )}
          
          {/* Confirm Button */}
          <Button
            size="lg"
            className="w-full bg-pos-green hover:bg-pos-green/90 text-white h-14 text-lg font-semibold touch-manipulation"
            onClick={handlePayment}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Confirmar Venta
              </>
            )}
          </Button>
        </div>
      </DialogContent>
      
      {/* Receipt Dialog */}
      <ReceiptDialog
        open={showReceipt}
        onOpenChange={(open) => {
          setShowReceipt(open);
          if (!open) {
            setCompletedSale(null);
          }
        }}
        sale={completedSale}
      />
    </Dialog>
  );
}
