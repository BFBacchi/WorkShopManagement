// Daily cash register closure component

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, CreditCard, Smartphone, Banknote, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePOSStore } from '../stores/pos-store';
import { formatCurrency } from '../utils/pos-utils';
import type { Sale, PaymentMethod } from '../types';

interface DailySummary {
  totalSales: number;
  totalAmount: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalMixed: number;
  salesCount: number;
  averageTicket: number;
}

export function CashRegisterClosure() {
  const { fetchSales, sales, loadingSales } = usePOSStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    if (open) {
      loadDailySales();
    }
  }, [open]);

  useEffect(() => {
    if (open && sales.length >= 0) {
      calculateSummary();
    }
  }, [sales, open]);

  const loadDailySales = async () => {
    try {
      await fetchSales(1000); // Get all sales for today
    } catch (error) {
      toast({
        title: 'Error al cargar ventas',
        description: 'Intenta nuevamente',
        variant: 'destructive',
      });
    }
  };

  const calculateSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    const summary: DailySummary = {
      totalSales: todaySales.length,
      totalAmount: todaySales.reduce((sum, sale) => sum + sale.total, 0),
      totalCash: todaySales
        .filter(sale => sale.payment_method === 'cash')
        .reduce((sum, sale) => sum + sale.total, 0),
      totalCard: todaySales
        .filter(sale => sale.payment_method === 'card')
        .reduce((sum, sale) => sum + sale.total, 0),
      totalTransfer: todaySales
        .filter(sale => sale.payment_method === 'transfer')
        .reduce((sum, sale) => sum + sale.total, 0),
      totalMixed: todaySales
        .filter(sale => sale.payment_method === 'mixed')
        .reduce((sum, sale) => sum + sale.total, 0),
      salesCount: todaySales.length,
      averageTicket: todaySales.length > 0
        ? todaySales.reduce((sum, sale) => sum + sale.total, 0) / todaySales.length
        : 0,
    };

    setSummary(summary);
  };

  const handleCloseRegister = () => {
    if (!summary) return;

    const closureData = {
      date: new Date().toISOString(),
      summary,
      sales: sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      }),
    };

    // Print closure report
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cierre de Caja - ${new Date().toLocaleDateString('es-MX')}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              .section {
                margin-bottom: 20px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px dashed #ccc;
              }
              .total {
                font-weight: bold;
                font-size: 14px;
                border-top: 2px solid #000;
                padding-top: 10px;
                margin-top: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CIERRE DE CAJA</h1>
              <p>Fecha: ${new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p>Hora: ${new Date().toLocaleTimeString('es-MX')}</p>
            </div>

            <div class="section">
              <h2>Resumen del Día</h2>
              <div class="row">
                <span>Total de Ventas:</span>
                <span>${summary.salesCount}</span>
              </div>
              <div class="row">
                <span>Monto Total:</span>
                <span>${formatCurrency(summary.totalAmount)}</span>
              </div>
              <div class="row">
                <span>Ticket Promedio:</span>
                <span>${formatCurrency(summary.averageTicket)}</span>
              </div>
            </div>

            <div class="section">
              <h2>Desglose por Método de Pago</h2>
              <div class="row">
                <span>Efectivo:</span>
                <span>${formatCurrency(summary.totalCash)}</span>
              </div>
              <div class="row">
                <span>Tarjeta:</span>
                <span>${formatCurrency(summary.totalCard)}</span>
              </div>
              <div class="row">
                <span>Transferencia:</span>
                <span>${formatCurrency(summary.totalTransfer)}</span>
              </div>
              ${summary.totalMixed > 0 ? `
              <div class="row">
                <span>Mixto:</span>
                <span>${formatCurrency(summary.totalMixed)}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <h2>Ventas del Día</h2>
              <table>
                <thead>
                  <tr>
                    <th># Venta</th>
                    <th>Cliente</th>
                    <th>Método</th>
                    <th>Total</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  ${closureData.sales.map((sale, index) => `
                    <tr>
                      <td>${sale.sale_number}</td>
                      <td>${sale.customer_name || 'N/A'}</td>
                      <td>${
                        sale.payment_method === 'cash' ? 'Efectivo' :
                        sale.payment_method === 'card' ? 'Tarjeta' :
                        sale.payment_method === 'transfer' ? 'Transferencia' : 'Mixto'
                      }</td>
                      <td>${formatCurrency(sale.total)}</td>
                      <td>${new Date(sale.sale_date).toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section total">
              <div class="row">
                <span>TOTAL GENERAL:</span>
                <span>${formatCurrency(summary.totalAmount)}</span>
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
              <p>Generado el ${new Date().toLocaleString('es-MX')}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    toast({
      title: 'Cierre de caja completado',
      description: `Resumen del día generado exitosamente`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Cierre de Caja
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Cierre de Caja Diario
          </DialogTitle>
        </DialogHeader>

        {loadingSales ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-pos-green border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Cargando ventas...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Date Info */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Fecha de Cierre</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Total Ventas</p>
                </div>
                <p className="text-2xl font-bold">{summary.salesCount}</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-pos-green" />
                  <p className="text-sm text-muted-foreground">Monto Total</p>
                </div>
                <p className="text-2xl font-bold text-pos-green">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </Card>
            </div>

            {/* Payment Methods Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Desglose por Método de Pago</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span>Efectivo</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.totalCash)}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Tarjeta</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.totalCard)}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <span>Transferencia</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(summary.totalTransfer)}</span>
                </div>
                
                {summary.totalMixed > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-orange-600" />
                        <span>Mixto</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(summary.totalMixed)}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Average Ticket */}
            <Card className="p-4 bg-pos-green/10 border-pos-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                  <p className="text-xl font-bold text-pos-green">
                    {formatCurrency(summary.averageTicket)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseRegister}
                className="flex-1 bg-pos-green hover:bg-pos-green/90 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Imprimir Cierre
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay ventas registradas hoy</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

