// Export Service - Data export functionality

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { ExportOptions } from '../types';

export class ExportService {
  async exportSales(options: ExportOptions) {
    const user = useAuthStore.getState().user;
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.uid)
      .gte('sale_date', options.date_range.start)
      .lte('sale_date', options.date_range.end)
      .order('sale_date', { ascending: false });

    if (error) throw error;

    return this.formatData(data || [], options);
  }

  async exportRepairs(options: ExportOptions) {
    const user = useAuthStore.getState().user;
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('user_id', user.uid)
      .gte('created_at', options.date_range.start)
      .lte('created_at', options.date_range.end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.formatData(data || [], options);
  }

  async exportProducts(options: ExportOptions) {
    const user = useAuthStore.getState().user;
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.formatData(data || [], options);
  }

  async exportCustomers(options: ExportOptions) {
    const user = useAuthStore.getState().user;
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.formatData(data || [], options);
  }

  private formatData(data: any[], options: ExportOptions): any[] {
    if (options.include_columns.length === 0) {
      return data;
    }

    return data.map((row) => {
      const formatted: any = {};
      options.include_columns.forEach((col) => {
        formatted[col] = row[col];
      });
      return formatted;
    });
  }

  async exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/"/g, '""');
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportToJSON(data: any[], filename: string) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportData(options: ExportOptions) {
    let data: any[] = [];

    switch (options.entity_type) {
      case 'sales':
        data = await this.exportSales(options);
        break;
      case 'repairs':
        data = await this.exportRepairs(options);
        break;
      case 'products':
        data = await this.exportProducts(options);
        break;
      case 'customers':
        data = await this.exportCustomers(options);
        break;
    }

    const filename = `${options.entity_type}_${options.date_range.start}_${options.date_range.end}`;

    if (options.format === 'csv') {
      await this.exportToCSV(data, filename);
    } else {
      await this.exportToJSON(data, filename);
    }

    return data;
  }
}

export const exportService = new ExportService();

