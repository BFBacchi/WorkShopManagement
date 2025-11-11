import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Smartphone,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  CheckCircle2,
  Loader2,
  Edit,
  Save,
  X
} from 'lucide-react';
import { RepairOrder, STATUS_LABELS, PRIORITY_LABELS, STATUS_FLOW, RepairStatus } from '../types';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '../utils/order-utils';
import { useRepairsStore } from '../stores/repairs-store';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { RepairTicket } from './RepairTicket';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderDetailProps {
  order: RepairOrder;
  onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const updateOrder = useRepairsStore((state) => state.updateOrder);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Editable fields
  const [diagnosis, setDiagnosis] = useState(order.diagnosis || '');
  const [notes, setNotes] = useState(order.notes || '');
  const [estimatedCost, setEstimatedCost] = useState(order.estimated_cost?.toString() || '');
  const [finalCost, setFinalCost] = useState(order.final_cost?.toString() || '');
  const [assignedTechnician, setAssignedTechnician] = useState(order.assigned_technician || '');

  const handleStatusChange = async (newStatus: RepairStatus) => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const updates: Partial<RepairOrder> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If delivering, set delivered_at
      if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('repair_orders')
        .update({
          status: updates.status,
          updated_at: updates.updated_at,
          delivered_at: updates.delivered_at,
        })
        .eq('id', order._id)
        .eq('user_id', user.uid);
      
      if (error) throw error;

      updateOrder(order._id, updates);

      toast({
        title: '✓ Estado actualizado',
        description: `Cambiado a: ${STATUS_LABELS[newStatus]}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const updates: Partial<RepairOrder> = {
        diagnosis: diagnosis || undefined,
        notes: notes || undefined,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        final_cost: finalCost ? parseFloat(finalCost) : undefined,
        assigned_technician: assignedTechnician || undefined,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('repair_orders')
        .update({
          diagnosis: updates.diagnosis || null,
          notes: updates.notes || null,
          estimated_cost: updates.estimated_cost || null,
          final_cost: updates.final_cost || null,
          assigned_technician: updates.assigned_technician || null,
          updated_at: updates.updated_at,
        })
        .eq('id', order._id)
        .eq('user_id', user.uid);
      
      if (error) throw error;

      updateOrder(order._id, updates);
      setIsEditing(false);

      toast({
        title: '✓ Detalles guardados',
        description: 'La información se actualizó correctamente'
      });
    } catch (error) {
      console.error('Error saving details:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentStatusIndex < STATUS_FLOW.length - 1 
    ? STATUS_FLOW[currentStatusIndex + 1] 
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono">{order.order_number}</h2>
            <Badge className={getStatusColor(order.status)}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Creado: {formatDate(order.created_at)}
          </p>
        </div>
        <RepairTicket order={order} />
      </div>

      {/* Quick Actions */}
      {nextStatus && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Siguiente paso</p>
              <p className="text-sm text-muted-foreground">
                Avanzar a: {STATUS_LABELS[nextStatus]}
              </p>
            </div>
            <Button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={loading}
              className="module-repairs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Avanzar
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Customer Info */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Device Info */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Dispositivo</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.device_brand} {order.device_model}</p>
              {order.device_imei && (
                <p className="text-muted-foreground">IMEI: {order.device_imei}</p>
              )}
              {order.device_password && (
                <p className="text-muted-foreground">PIN: {order.device_password}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Reported Issue */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Problema Reportado</h3>
            <p className="text-sm text-muted-foreground">{order.reported_issue}</p>
          </div>
        </div>
      </Card>

      {/* Diagnosis & Details */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">Diagnóstico y Detalles</h3>
          </div>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setDiagnosis(order.diagnosis || '');
                  setNotes(order.notes || '');
                  setEstimatedCost(order.estimated_cost?.toString() || '');
                  setFinalCost(order.final_cost?.toString() || '');
                  setAssignedTechnician(order.assigned_technician || '');
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveDetails}
                disabled={loading}
                className="module-repairs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Técnico Asignado</Label>
                <Input
                  placeholder="Nombre del técnico"
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Textarea
                  placeholder="Describe el diagnóstico técnico..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  placeholder="Notas y observaciones adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Costo Estimado</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Costo Final</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-sm">
              {order.assigned_technician && (
                <div>
                  <p className="text-muted-foreground mb-1">Técnico</p>
                  <p className="font-medium">{order.assigned_technician}</p>
                </div>
              )}
              {order.diagnosis ? (
                <div>
                  <p className="text-muted-foreground mb-1">Diagnóstico</p>
                  <p>{order.diagnosis}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Sin diagnóstico aún</p>
              )}
              {order.notes && (
                <div>
                  <p className="text-muted-foreground mb-1">Notas</p>
                  <p>{order.notes}</p>
                </div>
              )}
              {(order.estimated_cost || order.final_cost) && (
                <div className="flex gap-6 pt-2 border-t">
                  {order.estimated_cost && (
                    <div>
                      <p className="text-muted-foreground mb-1">Costo Estimado</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(order.estimated_cost)}
                      </p>
                    </div>
                  )}
                  {order.final_cost && (
                    <div>
                      <p className="text-muted-foreground mb-1">Costo Final</p>
                      <p className="font-semibold text-lg text-green-600">
                        {formatCurrency(order.final_cost)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Priority & Timeline */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold">Información Adicional</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Prioridad</p>
                <p className={`font-medium ${getPriorityColor(order.priority)}`}>
                  {PRIORITY_LABELS[order.priority]}
                </p>
              </div>
              {order.estimated_delivery && (
                <div>
                  <p className="text-muted-foreground mb-1">Entrega Estimada</p>
                  <p className="font-medium">
                    {formatDate(order.estimated_delivery)}
                  </p>
                </div>
              )}
            </div>
            {order.delivered_at && (
              <div className="pt-3 border-t">
                <p className="text-muted-foreground mb-1 text-sm">Fecha de Entrega</p>
                <p className="font-medium text-sm">
                  {formatDate(order.delivered_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Status Change Options */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Cambiar Estado</h3>
          <Select
            value={order.status}
            onValueChange={(v) => handleStatusChange(v as RepairStatus)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      )}
    </div>
  );
}
