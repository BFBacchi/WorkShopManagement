// Customer Types

export interface Customer {
  _uid: string;
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points?: number;
  total_spent?: number;
  total_orders?: number;
  last_visit?: string;
  created_at: string;
  updated_at?: string;
}

export interface CustomerHistory {
  type: 'repair' | 'sale' | 'reminder';
  id: string;
  date: string;
  description: string;
  amount?: number;
  status?: string;
}

export interface MaintenanceReminder {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  device_brand: string;
  device_model: string;
  reminder_date: string;
  message: string;
  sent: boolean;
  created_at: string;
}

