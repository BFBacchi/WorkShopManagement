import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAnalyticsStore } from '@/features/analytics/stores/analytics-store';
import { SalesChart } from '@/features/analytics/components/SalesChart';
import { RepairMetricsChart } from '@/features/analytics/components/RepairMetricsChart';
import { TechnicianPerformance } from '@/features/analytics/components/TechnicianPerformance';
import { CashFlowChart } from '@/features/analytics/components/CashFlowChart';
import { BestSellingProducts } from '@/features/analytics/components/BestSellingProducts';
import { AlertsWidget } from '@/features/analytics/components/AlertsWidget';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { loadAllData } = useAnalyticsStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Analíticas</h1>
            <p className="text-muted-foreground">Reportes y métricas del negocio</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6">
          {/* Top Row: Sales Chart and Alerts */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SalesChart />
            </div>
            <div>
              <AlertsWidget />
            </div>
          </div>

          {/* Second Row: Repair Metrics */}
          <RepairMetricsChart />

          {/* Third Row: Cash Flow and Best Selling Products */}
          <div className="grid md:grid-cols-2 gap-6">
            <CashFlowChart />
            <BestSellingProducts />
          </div>

          {/* Fourth Row: Technician Performance */}
          <TechnicianPerformance />
        </div>
      </div>
    </div>
  );
}
