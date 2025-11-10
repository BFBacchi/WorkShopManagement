// Cash Flow Chart Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useAnalyticsStore } from '../stores/analytics-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const chartConfig = {
  income: {
    label: 'Ingresos',
    color: 'hsl(var(--sales))',
  },
  expenses: {
    label: 'Gastos',
    color: 'hsl(var(--destructive))',
  },
};

export function CashFlowChart() {
  const { cashFlow, loadingCashFlow } = useAnalyticsStore();

  if (loadingCashFlow && cashFlow.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Caja</CardTitle>
          <CardDescription>Seguimiento de ingresos y gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = cashFlow.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = cashFlow.reduce((sum, item) => sum + item.expenses, 0);
  const netFlow = totalIncome - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flujo de Caja</CardTitle>
        <CardDescription>Seguimiento de ingresos y gastos</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--sales))]" />
              <p className="text-2xl font-bold text-[hsl(var(--sales))]">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos Totales</p>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Flujo Neto</p>
            <p
              className={`text-2xl font-bold ${
                netFlow >= 0 ? 'text-[hsl(var(--sales))]' : 'text-destructive'
              }`}
            >
              {formatCurrency(netFlow)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })
                }
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: any) => formatCurrency(value)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="hsl(var(--sales))"
                fill="hsl(var(--sales))"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

