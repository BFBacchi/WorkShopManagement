import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Smartphone, Clock, User } from 'lucide-react';
import { RepairOrder, STATUS_LABELS, PRIORITY_LABELS, RepairStatus } from '../types';
import { formatDateShort, formatCurrency, getStatusColor, getPriorityColor } from '../utils/order-utils';
import { useRepairsStore } from '../stores/repairs-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderListProps {
  onOrderClick: (order: RepairOrder) => void;
}

export function OrderList({ onOrderClick }: OrderListProps) {
  const orders = useRepairsStore((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.device_model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por orden, cliente, o dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-accent' : ''}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RepairStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({orders.length})</SelectItem>
                <SelectItem value="received">Recibido ({statusCounts.received || 0})</SelectItem>
                <SelectItem value="diagnosed">Diagnosticado ({statusCounts.diagnosed || 0})</SelectItem>
                <SelectItem value="in_repair">En Reparación ({statusCounts.in_repair || 0})</SelectItem>
                <SelectItem value="waiting_parts">Esperando Repuestos ({statusCounts.waiting_parts || 0})</SelectItem>
                <SelectItem value="finished">Finalizado ({statusCounts.finished || 0})</SelectItem>
                <SelectItem value="delivered">Entregado ({statusCounts.delivered || 0})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Smartphone className="w-12 h-12 opacity-20" />
            <div>
              <p className="font-medium">No hay órdenes</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Crea tu primera orden de reparación'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <Card
              key={order._id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onOrderClick(order)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">
                        {order.order_number}
                      </span>
                      <Badge className={getStatusColor(order.status)}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{order.customer_name}</span>
                      <span>•</span>
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                      {PRIORITY_LABELS[order.priority]}
                    </div>
                  </div>
                </div>

                {/* Device info */}
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {order.device_brand} {order.device_model}
                  </span>
                  {order.device_imei && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-xs">
                        IMEI: {order.device_imei}
                      </span>
                    </>
                  )}
                </div>

                {/* Issue */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.reported_issue}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateShort(order.created_at)}</span>
                  </div>
                  {order.estimated_cost && (
                    <span className="font-medium">
                      {formatCurrency(order.estimated_cost)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
