// Export Data Tab Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { exportService } from '../services/export-service';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { ExportOptions } from '../types';

export function ExportDataTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    date_range: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    include_columns: [],
    entity_type: 'sales',
  });

  const entityColumns: Record<string, string[]> = {
    sales: ['sale_number', 'sale_date', 'customer_name', 'customer_phone', 'items', 'subtotal', 'total', 'payment_method'],
    repairs: ['order_number', 'created_at', 'customer_name', 'customer_phone', 'device_brand', 'device_model', 'status', 'estimated_cost', 'final_cost'],
    products: ['name', 'category', 'brand', 'model', 'sku', 'price', 'cost', 'stock', 'status'],
    customers: ['name', 'phone', 'email', 'address', 'loyalty_points', 'created_at'],
  };

  const handleExport = async () => {
    if (exportOptions.include_columns.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos una columna para exportar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let data: any[] = [];

      switch (exportOptions.entity_type) {
        case 'sales':
          data = await exportService.exportSales(exportOptions);
          break;
        case 'repairs':
          data = await exportService.exportRepairs(exportOptions);
          break;
        case 'products':
          data = await exportService.exportProducts(exportOptions);
          break;
        case 'customers':
          data = await exportService.exportCustomers(exportOptions);
          break;
      }

      if (data.length === 0) {
        toast({
          title: 'Sin datos',
          description: 'No hay datos para exportar en el rango seleccionado',
        });
        return;
      }

      const filename = `${exportOptions.entity_type}_${exportOptions.date_range.start}_${exportOptions.date_range.end}`;

      if (exportOptions.format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToJSON(data, filename);
      }

      toast({
        title: 'Exportación exitosa',
        description: `Se exportaron ${data.length} registros`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo exportar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEntityTypeChange = (type: ExportOptions['entity_type']) => {
    setExportOptions({
      ...exportOptions,
      entity_type: type,
      include_columns: entityColumns[type] || [],
    });
  };

  const toggleColumn = (column: string) => {
    setExportOptions({
      ...exportOptions,
      include_columns: exportOptions.include_columns.includes(column)
        ? exportOptions.include_columns.filter((c) => c !== column)
        : [...exportOptions.include_columns, column],
    });
  };

  const selectAllColumns = () => {
    setExportOptions({
      ...exportOptions,
      include_columns: entityColumns[exportOptions.entity_type] || [],
    });
  };

  const deselectAllColumns = () => {
    setExportOptions({
      ...exportOptions,
      include_columns: [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Datos</CardTitle>
        <CardDescription>Exporta tus datos en diferentes formatos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity_type">Tipo de Datos</Label>
              <Select
                value={exportOptions.entity_type}
                onValueChange={handleEntityTypeChange as any}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="repairs">Reparaciones</SelectItem>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: 'csv' | 'json') =>
                  setExportOptions({ ...exportOptions, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={exportOptions.date_range.start}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    date_range: { ...exportOptions.date_range, start: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={exportOptions.date_range.end}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    date_range: { ...exportOptions.date_range, end: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Columnas a Incluir</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllColumns}>
                  Seleccionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllColumns}>
                  Deseleccionar Todas
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 p-4 border rounded-lg">
              {(entityColumns[exportOptions.entity_type] || []).map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={exportOptions.include_columns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <Label
                    htmlFor={column}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
