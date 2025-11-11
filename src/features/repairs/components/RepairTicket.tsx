import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepairOrder } from '../types';
import { formatDate, formatCurrency } from '../utils/order-utils';
import { useSettingsStore } from '@/features/settings/stores/settings-store';
import { STATUS_LABELS } from '../types';

interface RepairTicketProps {
  order: RepairOrder;
  size?: 'default' | 'sm';
}

export function RepairTicket({ order, size = 'default' }: RepairTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { businessSettings } = useSettingsStore();

  const handlePrint = () => {
    if (!ticketRef.current) return;
    
    // Clone the element to avoid modifying the original
    const clonedElement = ticketRef.current.cloneNode(true) as HTMLElement;
    const printContent = clonedElement.innerHTML;
    const businessName = businessSettings?.business_name || 'Taller de Reparaciones';
    const businessAddress = businessSettings?.business_address || '';
    const businessPhone = businessSettings?.business_phone || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Reparación - ${order.order_number}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
                font-size: 10px;
              }
              .tickets-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 100%;
              }
              .ticket-copy {
                width: 100%;
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
            body {
              margin: 0;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              max-width: 210mm;
            }
            .tickets-container {
              display: flex;
              flex-direction: column;
              gap: 10px;
              width: 100%;
            }
            .ticket-copy {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
              border: 1px dashed #000;
              padding: 10px;
              box-sizing: border-box;
            }
            .ticket-header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 5px;
            }
            .ticket-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 2px;
            }
            .ticket-subtitle {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
            .ticket-section {
              margin-bottom: 5px;
              padding-bottom: 4px;
              border-bottom: 1px dashed #ccc;
            }
            .ticket-section:last-child {
              border-bottom: none;
            }
            .ticket-label {
              font-weight: bold;
              font-size: 9px;
              margin-bottom: 1px;
            }
            .ticket-value {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .ticket-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .ticket-footer {
              text-align: center;
              margin-top: 6px;
              padding-top: 5px;
              border-top: 1px dashed #000;
              font-size: 8px;
              color: #666;
            }
            .copy-label {
              text-align: center;
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 5px;
              padding: 3px;
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    // Use a safer method to write content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.open('text/html', 'replace');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Use function reference instead of arrow function in setTimeout
    const printAndClose = () => {
      printWindow.print();
      printWindow.close();
    };
    
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(printAndClose, 250);
    };
  };

  const renderTicketCopy = (copyLabel: string) => (
    <div className="ticket-copy">
      <div className="copy-label">{copyLabel}</div>
      <div className="ticket-header">
        <div className="ticket-title">{businessSettings?.business_name || 'Taller de Reparaciones'}</div>
        {businessSettings?.business_address && (
          <div className="ticket-subtitle">{businessSettings.business_address}</div>
        )}
        {businessSettings?.business_phone && (
          <div className="ticket-subtitle">Tel: {businessSettings.business_phone}</div>
        )}
      </div>

      <div className="ticket-section">
        <div className="ticket-label">ORDEN DE REPARACIÓN</div>
        <div className="ticket-value" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {order.order_number}
        </div>
        <div className="ticket-value" style={{ fontSize: '10px', color: '#666' }}>
          Fecha: {formatDate(order.created_at)}
        </div>
      </div>

      <div className="ticket-section">
        <div className="ticket-label">CLIENTE</div>
        <div className="ticket-value">{order.customer_name}</div>
        <div className="ticket-value">Tel: {order.customer_phone}</div>
      </div>

      <div className="ticket-section">
        <div className="ticket-label">DISPOSITIVO</div>
        <div className="ticket-value">{order.device_brand} {order.device_model}</div>
        {order.device_imei && (
          <div className="ticket-value">IMEI: {order.device_imei}</div>
        )}
        {order.device_password && (
          <div className="ticket-value">PIN/Contraseña: {order.device_password}</div>
        )}
      </div>

      <div className="ticket-section">
        <div className="ticket-label">PROBLEMA REPORTADO</div>
        <div className="ticket-value" style={{ whiteSpace: 'pre-wrap' }}>
          {order.reported_issue}
        </div>
      </div>

      {order.diagnosis && (
        <div className="ticket-section">
          <div className="ticket-label">DIAGNÓSTICO</div>
          <div className="ticket-value" style={{ whiteSpace: 'pre-wrap' }}>
            {order.diagnosis}
          </div>
        </div>
      )}

      {order.assigned_technician && (
        <div className="ticket-section">
          <div className="ticket-label">TÉCNICO</div>
          <div className="ticket-value">{order.assigned_technician}</div>
        </div>
      )}

      <div className="ticket-section">
        <div className="ticket-label">ESTADO</div>
        <div className="ticket-value">{STATUS_LABELS[order.status]}</div>
      </div>

      {(order.estimated_cost || order.final_cost) && (
        <div className="ticket-section">
          <div className="ticket-label">COSTOS</div>
          {order.estimated_cost && (
            <div className="ticket-row">
              <span>Costo Estimado:</span>
              <span>{formatCurrency(order.estimated_cost)}</span>
            </div>
          )}
          {order.final_cost && (
            <div className="ticket-row" style={{ fontWeight: 'bold', fontSize: '12px' }}>
              <span>Costo Final:</span>
              <span>{formatCurrency(order.final_cost)}</span>
            </div>
          )}
        </div>
      )}

      {order.estimated_delivery && (
        <div className="ticket-section">
          <div className="ticket-label">ENTREGA ESTIMADA</div>
          <div className="ticket-value">{formatDate(order.estimated_delivery)}</div>
        </div>
      )}

      {order.notes && (
        <div className="ticket-section">
          <div className="ticket-label">NOTAS</div>
          <div className="ticket-value" style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
            {order.notes}
          </div>
        </div>
      )}

      <div className="ticket-footer">
        <div>Conserve este comprobante</div>
        <div style={{ marginTop: '4px' }}>
          Para consultas sobre su orden, presente este ticket
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div ref={ticketRef} style={{ display: 'none' }}>
        <div className="tickets-container">
          {renderTicketCopy('ORIGINAL - CLIENTE')}
          {renderTicketCopy('DUPLICADO - TALLER')}
        </div>
      </div>
      <Button
        onClick={handlePrint}
        className="module-repairs"
        variant="outline"
        size={size === 'sm' ? 'sm' : 'default'}
      >
        <Printer className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4 mr-2'} />
        {size === 'sm' ? null : 'Imprimir Ticket'}
      </Button>
    </div>
  );
}

