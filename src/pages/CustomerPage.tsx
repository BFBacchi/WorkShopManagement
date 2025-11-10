import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomerList } from '@/features/customers/components/CustomerList';
import { AddCustomerDialog } from '@/features/customers/components/AddCustomerDialog';
import { MaintenanceReminders } from '@/features/customers/components/MaintenanceReminders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomersPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de base de clientes</p>
          </div>
          <AddCustomerDialog />
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Lista de Clientes</TabsTrigger>
            <TabsTrigger value="reminders">Recordatorios</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <CustomerList />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <MaintenanceReminders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
