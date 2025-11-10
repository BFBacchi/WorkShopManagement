// Settings Page

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessSettingsTab } from '@/features/settings/components/BusinessSettingsTab';
import { ReceiptTemplatesTab } from '@/features/settings/components/ReceiptTemplatesTab';
import { ExportDataTab } from '@/features/settings/components/ExportDataTab';
import { UISettingsTab } from '@/features/settings/components/UISettingsTab';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Gestiona la configuración del sistema</p>
          </div>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="receipts">Recibos</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="ui">Interfaz</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <BusinessSettingsTab />
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <ReceiptTemplatesTab />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportDataTab />
          </TabsContent>

          <TabsContent value="ui" className="space-y-6">
            <UISettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

