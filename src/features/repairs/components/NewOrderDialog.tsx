import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Search, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useRepairsStore } from '../stores/repairs-store';
import { RepairOrder, Customer, Priority } from '../types';
import { generateOrderNumber, calculateEstimatedDelivery } from '../utils/order-utils';

interface NewOrderDialogProps {
  onOrderCreated?: () => void;
}

export function NewOrderDialog({ onOrderCreated }: NewOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'customer' | 'device'>('customer');
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { addOrder, addCustomer, findCustomerByPhone } = useRepairsStore();

  // Customer form state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  
  // Customer list state
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // Device form state
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [reportedIssue, setReportedIssue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedCost, setEstimatedCost] = useState('');

  // Load customers when dialog opens
  useEffect(() => {
    if (open && step === 'customer' && user?.uid) {
      loadCustomers();
    }
  }, [open, step, user?.uid]);

  const loadCustomers = async () => {
    if (!user?.uid) return;
    
    setLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.uid)
        .order('name', { ascending: true });

      if (error) throw error;

      const customers: Customer[] = (data || []).map((item: any) => ({
        _uid: item.user_id,
        _id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        address: item.address,
        created_at: item.created_at,
      }));

      setAllCustomers(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = allCustomers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    );
  });

  const resetForm = () => {
    setStep('customer');
    setCustomerPhone('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerAddress('');
    setExistingCustomer(null);
    setSearchQuery('');
    setDeviceBrand('');
    setDeviceModel('');
    setDeviceImei('');
    setDevicePassword('');
    setReportedIssue('');
    setPriority('medium');
    setEstimatedCost('');
  };

  const handleSelectCustomer = (customer: Customer) => {
    setExistingCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || '');
    setCustomerAddress(customer.address || '');
    setSearchQuery('');
    setStep('device');
  };

  const handleCreateNewCustomer = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: 'Error',
        description: 'Nombre y teléfono son requeridos',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: createdCustomerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: user.uid,
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          address: customerAddress || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (customerError) throw customerError;
      
      if (!createdCustomerData) {
        throw new Error('No se pudo recuperar el cliente creado');
      }
      
      const createdCustomer: Customer = {
        _uid: createdCustomerData.user_id,
        _id: createdCustomerData.id,
        name: createdCustomerData.name,
        phone: createdCustomerData.phone,
        email: createdCustomerData.email,
        address: createdCustomerData.address,
        created_at: createdCustomerData.created_at,
      };
      
      addCustomer(createdCustomer);
      setAllCustomers([createdCustomer, ...allCustomers]);
      setExistingCustomer(createdCustomer);
      setShowNewCustomerDialog(false);
      setStep('device');
      
      toast({
        title: 'Cliente creado',
        description: `${createdCustomer.name} ha sido agregado exitosamente`,
      });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión',
        variant: 'destructive'
      });
      return;
    }

    if (!customerName.trim() || !deviceBrand.trim() || !deviceModel.trim() || !reportedIssue.trim()) {
      toast({
        title: 'Error',
        description: 'Completa todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let customerId = existingCustomer?._id;

      // Use existing customer ID
      if (!existingCustomer) {
        throw new Error('Debes seleccionar o crear un cliente');
      }
      
      customerId = existingCustomer._id;

      // Verify we have a valid customer ID
      if (!customerId) {
        throw new Error('Customer ID is missing');
      }

      // Create repair order
      const orderData: Omit<RepairOrder, '_id'> = {
        _uid: user.uid,
        order_number: generateOrderNumber(),
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        device_brand: deviceBrand,
        device_model: deviceModel,
        device_imei: deviceImei || undefined,
        device_password: devicePassword || undefined,
        reported_issue: reportedIssue,
        status: 'received',
        priority,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_delivery: calculateEstimatedDelivery(3)
      };

      // Create order
      const { data: createdOrderData, error: orderError } = await supabase
        .from('repair_orders')
        .insert({
          user_id: user.uid,
          order_number: orderData.order_number,
          customer_id: customerId,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          device_brand: orderData.device_brand,
          device_model: orderData.device_model,
          device_imei: orderData.device_imei || null,
          device_password: orderData.device_password || null,
          reported_issue: orderData.reported_issue,
          status: orderData.status,
          priority: orderData.priority,
          estimated_cost: orderData.estimated_cost || null,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          estimated_delivery: orderData.estimated_delivery,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (!createdOrderData) {
        throw new Error('No se pudo recuperar la orden creada');
      }
      
      const createdOrder: RepairOrder = {
        _uid: createdOrderData.user_id,
        _id: createdOrderData.id,
        order_number: createdOrderData.order_number,
        customer_id: createdOrderData.customer_id,
        customer_name: createdOrderData.customer_name,
        customer_phone: createdOrderData.customer_phone,
        device_brand: createdOrderData.device_brand,
        device_model: createdOrderData.device_model,
        device_imei: createdOrderData.device_imei,
        device_password: createdOrderData.device_password,
        reported_issue: createdOrderData.reported_issue,
        diagnosis: createdOrderData.diagnosis,
        estimated_cost: createdOrderData.estimated_cost,
        final_cost: createdOrderData.final_cost,
        status: createdOrderData.status,
        assigned_technician: createdOrderData.assigned_technician,
        priority: createdOrderData.priority,
        photos: createdOrderData.photos,
        notes: createdOrderData.notes,
        created_at: createdOrderData.created_at,
        updated_at: createdOrderData.updated_at,
        estimated_delivery: createdOrderData.estimated_delivery,
        delivered_at: createdOrderData.delivered_at,
      };
      
      addOrder(createdOrder);

      toast({
        title: '✓ Orden creada',
        description: `${orderData.order_number} - ${customerName}`
      });

      setOpen(false);
      resetForm();
      onOrderCreated?.();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la orden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="module-repairs">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Reparación</DialogTitle>
          <DialogDescription>
            {step === 'customer' ? 'Paso 1: Información del cliente' : 'Paso 2: Información del equipo'}
          </DialogDescription>
        </DialogHeader>

        {step === 'customer' ? (
          <div className="space-y-4">
            {existingCustomer ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✓ Cliente seleccionado
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  {existingCustomer.name} - {existingCustomer.phone}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setExistingCustomer(null);
                    setCustomerName('');
                    setCustomerPhone('');
                    setCustomerEmail('');
                    setCustomerAddress('');
                  }}
                >
                  Cambiar cliente
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar cliente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre, teléfono o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Seleccionar cliente</Label>
                      <ScrollArea className="h-[300px] border rounded-md p-2">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No se encontraron clientes</p>
                            {searchQuery && (
                              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {filteredCustomers.map((customer) => (
                              <button
                                key={customer._id}
                                type="button"
                                onClick={() => handleSelectCustomer(customer)}
                                className="w-full text-left p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border"
                              >
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.phone}
                                  {customer.email && ` • ${customer.email}`}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowNewCustomerDialog(true)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {existingCustomer && (
              <Button
                onClick={() => setStep('device')}
                className="w-full module-repairs"
              >
                Continuar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  placeholder="Apple, Samsung, Xiaomi..."
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  placeholder="iPhone 15, Galaxy S24..."
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei">IMEI (opcional)</Label>
              <Input
                id="imei"
                placeholder="15 dígitos"
                value={deviceImei}
                onChange={(e) => setDeviceImei(e.target.value)}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña/PIN (opcional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Para desbloquear el equipo"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Problema Reportado *</Label>
              <Textarea
                id="issue"
                placeholder="Describe el problema del equipo..."
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Costo Estimado (opcional)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('customer')} className="flex-1">
                Atrás
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 module-repairs">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Orden'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Dialog for creating new customer */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa la información del cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10 dígitos"
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-address">Dirección</Label>
              <Textarea
                id="new-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Calle, número, ciudad..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewCustomerDialog(false);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setCustomerAddress('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateNewCustomer}
              disabled={loading}
              className="module-repairs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
