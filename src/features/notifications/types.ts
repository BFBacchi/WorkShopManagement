// Notification types

export type NotificationType = 
  | 'low_stock' 
  | 'overdue' 
  | 'low_revenue' 
  | 'order_created' 
  | 'order_updated' 
  | 'sale_completed' 
  | 'reminder' 
  | 'system';

export type NotificationSeverity = 'low' | 'medium' | 'high';

export interface Notification {
  _uid: string;
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  related_id?: string;
  related_type?: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  bySeverity: {
    high: number;
    medium: number;
    low: number;
  };
}

