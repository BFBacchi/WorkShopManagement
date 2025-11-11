// Notification Service - Email integration with Resend

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class NotificationService {
  private apiKey: string;
  private baseURL: string = 'https://api.resend.com';
  private defaultFrom: string = 'Taller Pro <noreply@tallerpro.com>';

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    if (!this.apiKey && import.meta.env.DEV) {
      // Solo mostrar warning en desarrollo
      console.info('Resend API key not found. Email notifications will be disabled.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      if (import.meta.env.DEV) {
        console.info('Cannot send email: Resend API key not configured');
      }
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: options.from || this.defaultFrom,
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error sending email');
      }

      return true;
    } catch (error: any) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendMaintenanceReminder(
    customerEmail: string,
    customerName: string,
    deviceBrand: string,
    deviceModel: string,
    reminderDate: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Mantenimiento</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Taller Pro</h1>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
            <h2 style="color: #2563eb;">Recordatorio de Mantenimiento</h2>
            <p>Hola ${customerName},</p>
            <p>Te recordamos que es momento de realizar el mantenimiento de tu dispositivo:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Dispositivo:</strong> ${deviceBrand} ${deviceModel}</p>
              <p style="margin: 5px 0;"><strong>Fecha sugerida:</strong> ${new Date(reminderDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
            <p>Te invitamos a visitarnos para mantener tu dispositivo en óptimas condiciones.</p>
            <p style="margin-top: 30px;">Saludos cordiales,<br>El equipo de Taller Pro</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Este es un email automático, por favor no responder.</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Recordatorio de Mantenimiento - ${deviceBrand} ${deviceModel}`,
      html,
    });
  }

  async sendOrderStatusUpdate(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    status: string,
    message?: string
  ): Promise<boolean> {
    const statusLabels: Record<string, string> = {
      received: 'Recibida',
      diagnosed: 'Diagnosticada',
      'in_repair': 'En Reparación',
      'waiting_parts': 'Esperando Repuestos',
      finished: 'Finalizada',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Actualización de Orden</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Taller Pro</h1>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
            <h2 style="color: #2563eb;">Actualización de Orden</h2>
            <p>Hola ${customerName},</p>
            <p>Tu orden de reparación ha sido actualizada:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Número de Orden:</strong> ${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> ${statusLabels[status] || status}</p>
            </div>
            ${message ? `<p>${message}</p>` : ''}
            <p style="margin-top: 30px;">Saludos cordiales,<br>El equipo de Taller Pro</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Este es un email automático, por favor no responder.</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Actualización de Orden ${orderNumber}`,
      html,
    });
  }
}

export const notificationService = new NotificationService();

