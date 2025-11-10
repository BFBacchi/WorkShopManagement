// Repair Metrics Chart Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '../stores/analytics-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'hsl(var(--repairs))',
  received: 'hsl(var(--repairs))',
  diagnosed: '#3b82f6',
  'in_repair': '#f59e0b',
  'in_progress': '#f59e0b',
  'waiting_parts': '#ef4444',
  finished: '#10b981',
  completed: '#10b981',
  delivered: '#10b981',
  cancelled: '#6b7280',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  received: 'Recibida',
  diagnosed: 'Diagnosticada',
  'in_repair': 'En Reparación',
  'in_progress': 'En Proceso',
  'waiting_parts': 'Esperando Repuestos',
  finished: 'Finalizada',
  completed: 'Completada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

export function RepairMetricsChart() {
  const { repairMetrics, loadingRepairs } = useAnalyticsStore();

  if (loadingRepairs && repairMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Reparaciones</CardTitle>
          <CardDescription>Distribución por estado y rentabilidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = repairMetrics.map((metric) => ({
    ...metric,
    statusLabel: statusLabels[metric.status] || metric.status,
  }));

  const pieData = chartData.map((metric) => ({
    name: statusLabels[metric.status] || metric.status,
    value: metric.count,
    color: statusColors[metric.status] || '#8884d8',
  }));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
          <CardDescription>Órdenes por estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue by Status Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Estado</CardTitle>
          <CardDescription>Rentabilidad por estado de reparación</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="statusLabel" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  }
                />
                <Bar
                  dataKey="totalRevenue"
                  fill="hsl(var(--repairs))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

