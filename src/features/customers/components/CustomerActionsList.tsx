// Customer Actions List Component

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomersStore } from '../stores/customers-store';
import { CustomerAction } from '../types';
import { Loader2, Plus, Pencil, Trash2, MoreVertical, FileText, Phone, Mail, Calendar, CheckSquare, Tag } from 'lucide-react';
import { AddCustomerActionDialog } from './AddCustomerActionDialog';
import { EditCustomerActionDialog } from './EditCustomerActionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerActionsListProps {
  customerId: string;
}

const actionTypeLabels: Record<CustomerAction['action_type'], string> = {
  note: 'Nota',
  call: 'Llamada',
  visit: 'Visita',
  email: 'Email',
  task: 'Tarea',
  other: 'Otro',
};

const actionTypeIcons: Record<CustomerAction['action_type'], React.ReactNode> = {
  note: <FileText className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  visit: <Calendar className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  other: <Tag className="h-4 w-4" />,
};

export function CustomerActionsList({ customerId }: CustomerActionsListProps) {
  const {
    customerActions,
    loadingActions,
    fetchCustomerActions,
    deleteCustomerAction,
  } = useCustomersStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<CustomerAction | null>(null);
  const [deletingAction, setDeletingAction] = useState<CustomerAction | null>(null);

  useEffect(() => {
    fetchCustomerActions(customerId);
  }, [customerId, fetchCustomerActions]);

  const handleDelete = async () => {
    if (deletingAction) {
      await deleteCustomerAction(deletingAction.id);
      setDeletingAction(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Acciones del Cliente</CardTitle>
              <CardDescription>Registro de actividades y notas</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Acción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingActions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : customerActions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay acciones registradas</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Acción
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {actionTypeIcons[action.action_type]}
                          {actionTypeLabels[action.action_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{action.title}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground truncate">
                          {action.description || 'Sin descripción'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(action.action_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAction(action)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingAction(action)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddCustomerActionDialog
          customerId={customerId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}

      {editingAction && (
        <EditCustomerActionDialog
          action={editingAction}
          open={!!editingAction}
          onOpenChange={(open) => !open && setEditingAction(null)}
        />
      )}

      <AlertDialog open={!!deletingAction} onOpenChange={(open) => !open && setDeletingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la acción "{deletingAction?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

