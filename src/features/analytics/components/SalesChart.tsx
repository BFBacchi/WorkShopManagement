// Sales Chart Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '../stores/analytics-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  sales: {
    label: 'Ventas',
    color: 'hsl(var(--sales))',
  },
};

export function SalesChart() {
  const { dailySales, weeklySales, monthlySales, loadingSales, fetchSalesData } =
    useAnalyticsStore();

  const handleTabChange = (value: string) => {
    fetchSalesData(value as 'daily' | 'weekly' | 'monthly');
  };

  const formatDate = (dateStr: string, period: string) => {
    const date = new Date(dateStr);
    if (period === 'daily') {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } else if (period === 'weekly') {
      // Calculate week number manually
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      return `Sem ${weekNumber}`;
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
  };

  if (loadingSales && dailySales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
          <CardDescription>Evolución de ventas por período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
        <CardDescription>Evolución de ventas por período</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Diario</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatDate(value, 'daily')}
                  />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--sales))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatDate(value, 'weekly')}
                  />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--sales))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatDate(value, 'monthly')}
                  />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) => formatCurrency(value)}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--sales))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

