import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de base de clientes</p>
          </div>
          <Button className="module-customers">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>Este módulo estará disponible en la siguiente fase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí podrás administrar tu base de datos de clientes y su historial.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
