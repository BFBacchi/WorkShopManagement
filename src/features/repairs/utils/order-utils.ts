/**
 * Generate unique order number based on date and sequence
 */
export function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `ORD-${year}${month}${day}-${time}${random}`;
  }
  
  /**
   * Calculate estimated delivery date (default 3 days from now)
   */
  export function calculateEstimatedDelivery(daysFromNow: number = 3): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }
  
  /**
   * Format currency for display
   */
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  
  /**
   * Format date for display
   */
  export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  /**
   * Format date for display (short version)
   */
  export function formatDateShort(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  /**
   * Get status color class
   */
  export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      received: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      diagnosed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      in_repair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      waiting_parts: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      finished: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      delivered: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || colors.received;
  }
  
  /**
   * Get priority color class
   */
  export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.medium;
  }
  