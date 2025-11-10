// Maintenance Reminders Component

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomersStore } from '../stores/customers-store';
import { notificationService } from '../services/notification-service';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Mail, CheckCircle, Loader2, Bell } from 'lucide-react';

export function MaintenanceReminders() {
  const { reminders, loadingReminders, fetchReminders, markReminderSent } = useCustomersStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSendReminder = async (reminder: any) => {
    if (!reminder.customer_email) {
      toast({
        title: 'Error',
        description: 'El cliente no tiene email registrado',
        variant: 'destructive',
      });
      return;
    }

    try {
      const sent = await notificationService.sendMaintenanceReminder(
        reminder.customer_email,
        reminder.customer_name,
        reminder.device_brand,
        reminder.device_model,
        reminder.reminder_date
      );

      if (sent) {
        await markReminderSent(reminder.id);
        toast({
          title: 'Recordatorio enviado',
          description: `Se envió el recordatorio a ${reminder.customer_name}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo enviar el recordatorio',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al enviar el recordatorio',
        variant: 'destructive',
      });
    }
  };

  const upcomingReminders = reminders.filter(
    (r) => !r.sent && new Date(r.reminder_date) >= new Date()
  );
  const pastReminders = reminders.filter(
    (r) => !r.sent && new Date(r.reminder_date) < new Date()
  );
  const sentReminders = reminders.filter((r) => r.sent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recordatorios de Mantenimiento
        </CardTitle>
        <CardDescription>
          Gestiona los recordatorios de mantenimiento para tus clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingReminders ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay recordatorios programados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Reminders */}
            {upcomingReminders.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Próximos Recordatorios</h3>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{reminder.customer_name}</p>
                          <Badge variant="secondary">
                            {new Date(reminder.reminder_date).toLocaleDateString('es-ES')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reminder.device_brand} {reminder.device_model}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reminder.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {reminder.customer_email ? (
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(reminder)}
                            variant="outline"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar
                          </Button>
                        ) : (
                          <Badge variant="outline">Sin email</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Reminders */}
            {pastReminders.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-orange-600">Recordatorios Vencidos</h3>
                <div className="space-y-3">
                  {pastReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{reminder.customer_name}</p>
                          <Badge variant="destructive">
                            {new Date(reminder.reminder_date).toLocaleDateString('es-ES')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reminder.device_brand} {reminder.device_model}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {reminder.customer_email ? (
                          <Button
                            size="sm"
                            onClick={() => handleSendReminder(reminder)}
                            variant="outline"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Ahora
                          </Button>
                        ) : (
                          <Badge variant="outline">Sin email</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Reminders */}
            {sentReminders.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-600">Enviados</h3>
                <div className="space-y-3">
                  {sentReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card opacity-60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{reminder.customer_name}</p>
                          <Badge variant="outline">
                            {new Date(reminder.reminder_date).toLocaleDateString('es-ES')}
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reminder.device_brand} {reminder.device_model}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

