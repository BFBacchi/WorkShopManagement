// Technician Performance Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyticsStore } from '../stores/analytics-store';
import { formatCurrency } from '@/features/pos/utils/pos-utils';
import { Loader2, TrendingUp } from 'lucide-react';

export function TechnicianPerformance() {
  const { technicianPerformance, loadingTechnicians } = useAnalyticsStore();

  if (loadingTechnicians && technicianPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Técnicos</CardTitle>
          <CardDescription>Estadísticas de productividad por técnico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (technicianPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Técnicos</CardTitle>
          <CardDescription>Estadísticas de productividad por técnico</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay datos de técnicos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento de Técnicos</CardTitle>
        <CardDescription>Estadísticas de productividad por técnico</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Técnico</TableHead>
              <TableHead>Órdenes Completadas</TableHead>
              <TableHead>Tiempo Promedio</TableHead>
              <TableHead className="text-right">Ingresos Generados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicianPerformance.map((tech, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{tech.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    {tech.completedOrders}
                  </div>
                </TableCell>
                <TableCell>
                  {tech.avgTime > 0
                    ? `${tech.avgTime.toFixed(1)} horas`
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(tech.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

