// Receipt dialog with QR code for completed sales

import { useRef, useEffect, useState } from 'react';
import { Printer, X } from 'lucide-react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePOSStore } from '../stores/pos-store';
import { formatCurrency } from '../utils/pos-utils';
import type { Sale } from '../types';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export function ReceiptDialog({ open, onOpenChange, sale }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (sale) {
      const qrData = JSON.stringify({
        sale_number: sale.sale_number,
        total: sale.total,
        date: sale.sale_date,
      });
      
      QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error('Error generating QR code:', err);
        });
    }
  }, [sale]);

  if (!sale) return null;

  const items = JSON.parse(sale.items || '[]');

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo - ${sale.sale_number}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
              }
            }
            body {
              margin: 0;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              max-width: 80mm;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .receipt-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 11px;
            }
            .receipt-total {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
            }
            .qr-code {
              text-align: center;
              margin-top: 15px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 15px;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recibo de Venta</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white p-6 rounded-lg border-2 border-gray-200">
          {/* Receipt Header */}
          <div className="receipt-header text-center border-b border-dashed border-gray-300 pb-4 mb-4">
            <h2 className="text-xl font-bold mb-1">Taller de Reparación</h2>
            <p className="text-sm text-gray-600">Sistema de Gestión</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(sale.sale_date).toLocaleString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Sale Number */}
          <div className="text-center mb-4">
            <p className="text-sm font-semibold">Venta: {sale.sale_number}</p>
            {sale.customer_name && (
              <p className="text-xs text-gray-600 mt-1">
                Cliente: {sale.customer_name}
              </p>
            )}
            {sale.customer_phone && (
              <p className="text-xs text-gray-600">
                Tel: {sale.customer_phone}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {items.map((item: any, index: number) => (
              <div key={index} className="receipt-item flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-600">
                    {item.quantity} x {formatCurrency(item.product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="receipt-total border-t border-dashed border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount_value > 0 && sale.discount_type !== 'none' && (
              <div className="flex justify-between text-sm text-red-600">
                <span>
                  Descuento ({sale.discount_type === 'percentage' ? `${sale.discount_value}%` : 'Fijo'}):
                </span>
                <span>-{formatCurrency(sale.subtotal - sale.total)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <p>Método de pago: {
                sale.payment_method === 'cash' ? 'Efectivo' :
                sale.payment_method === 'card' ? 'Tarjeta' :
                sale.payment_method === 'transfer' ? 'Transferencia' : 'Mixto'
              }</p>
              {sale.cashier_name && (
                <p className="mt-1">Cajero: {sale.cashier_name}</p>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="qr-code text-center mt-6">
            <div className="flex justify-center mb-2">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-[120px] h-[120px]"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 animate-pulse rounded" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              Escanea para verificar la venta
            </p>
          </div>

          {/* Footer */}
          <div className="receipt-footer text-center mt-6 text-xs text-gray-500">
            <p>Gracias por su compra</p>
            <p className="mt-1">www.taller-reparacion.com</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-pos-green hover:bg-pos-green/90 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

