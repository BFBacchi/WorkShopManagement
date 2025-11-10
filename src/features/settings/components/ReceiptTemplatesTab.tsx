// Receipt Templates Tab Component

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSettingsStore } from '../stores/settings-store';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Trash2, Check } from 'lucide-react';
import { ReceiptTemplate } from '../types';

export function ReceiptTemplatesTab() {
  const {
    receiptTemplates,
    activeReceiptTemplate,
    loadingTemplates,
    fetchReceiptTemplates,
    createReceiptTemplate,
    updateReceiptTemplate,
    deleteReceiptTemplate,
    setActiveReceiptTemplate,
  } = useSettingsStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReceiptTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    header_text: '',
    footer_text: '',
    show_logo: false,
    logo_url: '',
    show_qr_code: true,
    show_tax_id: false,
    show_business_info: true,
    font_size: 'medium' as 'small' | 'medium' | 'large',
    paper_width: 80,
  });

  useEffect(() => {
    fetchReceiptTemplates();
  }, [fetchReceiptTemplates]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      header_text: '',
      footer_text: '',
      show_logo: false,
      logo_url: '',
      show_qr_code: true,
      show_tax_id: false,
      show_business_info: true,
      font_size: 'medium',
      paper_width: 80,
    });
    setDialogOpen(true);
  };

  const handleEditTemplate = (template: ReceiptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      header_text: template.header_text,
      footer_text: template.footer_text,
      show_logo: template.show_logo,
      logo_url: template.logo_url || '',
      show_qr_code: template.show_qr_code,
      show_tax_id: template.show_tax_id,
      show_business_info: template.show_business_info,
      font_size: template.font_size,
      paper_width: template.paper_width,
    });
    setDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        await updateReceiptTemplate(editingTemplate.id, formData);
        toast({
          title: 'Plantilla actualizada',
          description: 'La plantilla se ha actualizado exitosamente',
        });
      } else {
        await createReceiptTemplate(formData);
        toast({
          title: 'Plantilla creada',
          description: 'La plantilla se ha creado exitosamente',
        });
      }
      setDialogOpen(false);
      await fetchReceiptTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la plantilla',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await deleteReceiptTemplate(id);
        toast({
          title: 'Plantilla eliminada',
          description: 'La plantilla se ha eliminado exitosamente',
        });
        await fetchReceiptTemplates();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo eliminar la plantilla',
          variant: 'destructive',
        });
      }
    }
  };

  if (loadingTemplates) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plantillas de Recibos</CardTitle>
              <CardDescription>
                Personaliza las plantillas de recibos para tus ventas
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </DialogTitle>
                  <DialogDescription>
                    Configura los detalles de la plantilla de recibo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template_name">Nombre de la Plantilla *</Label>
                    <Input
                      id="template_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="header_text">Texto del Encabezado</Label>
                    <Input
                      id="header_text"
                      value={formData.header_text}
                      onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Texto del Pie</Label>
                    <Input
                      id="footer_text"
                      value={formData.footer_text}
                      onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font_size">Tamaño de Fuente</Label>
                    <Select
                      value={formData.font_size}
                      onValueChange={(value: 'small' | 'medium' | 'large') =>
                        setFormData({ ...formData, font_size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Mediano</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paper_width">Ancho del Papel (mm)</Label>
                    <Input
                      id="paper_width"
                      type="number"
                      min="58"
                      max="110"
                      value={formData.paper_width}
                      onChange={(e) =>
                        setFormData({ ...formData, paper_width: parseInt(e.target.value) || 80 })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_logo">Mostrar Logo</Label>
                      <Switch
                        id="show_logo"
                        checked={formData.show_logo}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_logo: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_qr_code">Mostrar Código QR</Label>
                      <Switch
                        id="show_qr_code"
                        checked={formData.show_qr_code}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_qr_code: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_tax_id">Mostrar ID Fiscal</Label>
                      <Switch
                        id="show_tax_id"
                        checked={formData.show_tax_id}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_tax_id: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_business_info">Mostrar Info del Negocio</Label>
                      <Switch
                        id="show_business_info"
                        checked={formData.show_business_info}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_business_info: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTemplate}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {receiptTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay plantillas creadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receiptTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{template.name}</p>
                      {activeReceiptTemplate?.id === template.id && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.font_size} • {template.paper_width}mm
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeReceiptTemplate?.id !== template.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveReceiptTemplate(template.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Activar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Editar
                    </Button>
                    {receiptTemplates.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

