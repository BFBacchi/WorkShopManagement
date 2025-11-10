// UI Settings Tab Component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '../stores/settings-store';
import { useTheme } from 'next-themes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UISettingsTab() {
  const { uiSettings, updateUISettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSave = () => {
    updateUISettings({ theme: theme as any });
    toast({
      title: 'Configuración guardada',
      description: 'Los cambios se han aplicado',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Interfaz</CardTitle>
        <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animaciones</Label>
              <p className="text-sm text-muted-foreground">
                Habilita animaciones y transiciones suaves
              </p>
            </div>
            <Switch
              id="animations"
              checked={uiSettings.animations_enabled}
              onCheckedChange={(checked) =>
                updateUISettings({ animations_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact_mode">Modo Compacto</Label>
              <p className="text-sm text-muted-foreground">
                Reduce el espaciado para mostrar más contenido
              </p>
            </div>
            <Switch
              id="compact_mode"
              checked={uiSettings.compact_mode}
              onCheckedChange={(checked) => updateUISettings({ compact_mode: checked })}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

