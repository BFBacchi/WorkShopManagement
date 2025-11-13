// Settings Types

export interface BusinessSettings {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_tax_id: string;
  currency: string;
  tax_rate: number;
  loyalty_points_rate: number; // Points per dollar spent
  low_stock_threshold: number;
  default_payment_method: 'cash' | 'card' | 'transfer';
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  header_text: string;
  footer_text: string;
  show_logo: boolean;
  logo_url?: string;
  show_tax_id: boolean;
  show_business_info: boolean;
  font_size: 'small' | 'medium' | 'large';
  paper_width: number; // mm
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  primary_color: string;
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  compact_mode: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  date_range: {
    start: string;
    end: string;
  };
  include_columns: string[];
  entity_type: 'sales' | 'repairs' | 'products' | 'customers';
}

