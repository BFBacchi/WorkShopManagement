// Best Selling Products Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '../stores/analytics-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2, Package } from 'lucide-react';

const chartConfig = {
  quantity: {
    label: 'Cantidad',
    color: 'hsl(var(--inventory))',
  },
};

export function BestSellingProducts() {
  const { bestSellingProducts, loadingProducts } = useAnalyticsStore();

  if (loadingProducts && bestSellingProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Top 10 productos por cantidad vendida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bestSellingProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Top 10 productos por cantidad vendida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>Top 10 productos por cantidad vendida</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bestSellingProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: any, name: string) => {
                      if (name === 'quantity') {
                        return [`${value} unidades`, 'Cantidad'];
                      }
                      return [formatCurrency(value), 'Ingresos'];
                    }}
                  />
                }
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--inventory))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Product List */}
        <div className="mt-6 space-y-2">
          {bestSellingProducts.slice(0, 5).map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--inventory))] flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {product.quantity} unidades
                </span>
                <span className="font-semibold">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

