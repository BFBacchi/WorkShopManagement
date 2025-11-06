export type RepairStatus = 
  | 'received' 
  | 'diagnosed' 
  | 'in_repair' 
  | 'waiting_parts' 
  | 'finished' 
  | 'delivered' 
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Customer {
  _uid: string;
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface RepairOrder {
  _uid: string;
  _id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  device_brand: string;
  device_model: string;
  device_imei?: string;
  device_password?: string;
  reported_issue: string;
  diagnosis?: string;
  estimated_cost?: number;
  final_cost?: number;
  status: RepairStatus;
  assigned_technician?: string;
  priority: Priority;
  photos?: string; // JSON array
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  delivered_at?: string;
}

export const STATUS_LABELS: Record<RepairStatus, string> = {
  received: 'Recibido',
  diagnosed: 'Diagnosticado',
  in_repair: 'En Reparación',
  waiting_parts: 'Esperando Repuestos',
  finished: 'Finalizado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

export const STATUS_FLOW: RepairStatus[] = [
  'received',
  'diagnosed',
  'in_repair',
  'waiting_parts',
  'finished',
  'delivered'
];
