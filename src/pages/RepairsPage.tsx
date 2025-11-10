import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useRepairsStore } from '@/features/repairs/stores/repairs-store';
import { RepairOrder, Customer } from '@/features/repairs/types';
import { NewOrderDialog } from '@/features/repairs/components/NewOrderDialog';
import { OrderList } from '@/features/repairs/components/OrderList';
import { OrderDetail } from '@/features/repairs/components/OrderDetail';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function RepairsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { 
    orders, 
    customers,
    selectedOrder,
    isLoading,
    setOrders, 
    setCustomers,
    setSelectedOrder,
    setIsLoading 
  } = useRepairsStore();
  
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (user?.uid && !initialLoadComplete) {
      loadData();
    }
  }, [user?.uid, initialLoadComplete]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (ordersError) throw ordersError;
      
      // Map to RepairOrder format
      const userOrders: RepairOrder[] = (ordersData || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        order_number: item.order_number,
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        device_brand: item.device_brand,
        device_model: item.device_model,
        device_imei: item.device_imei,
        device_password: item.device_password,
        reported_issue: item.reported_issue,
        diagnosis: item.diagnosis,
        estimated_cost: item.estimated_cost,
        final_cost: item.final_cost,
        status: item.status,
        assigned_technician: item.assigned_technician,
        priority: item.priority,
        photos: item.photos,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        estimated_delivery: item.estimated_delivery,
        delivered_at: item.delivered_at,
      }));
      
      setOrders(userOrders);

      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (customersError) throw customersError;
      
      // Map to Customer format
      const userCustomers: Customer[] = (customersData || []).map(item => ({
        _uid: item.user_id,
        _id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        address: item.address,
        created_at: item.created_at,
      }));
      
      setCustomers(userCustomers);
      
      setInitialLoadComplete(true);
    } catch (error: any) {
      console.error('Error loading data:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCreated = () => {
    // Orders are updated via store, no need to reload
  };

  const handleOrderClick = (order: RepairOrder) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => selectedOrder ? handleBackToList() : navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Reparaciones</h1>
            <p className="text-muted-foreground">
              {selectedOrder 
                ? `Orden ${selectedOrder.order_number}`
                : 'Gestión de órdenes de servicio'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            {!selectedOrder && <NewOrderDialog onOrderCreated={handleOrderCreated} />}
          </div>
        </div>

        {isLoading && !initialLoadComplete ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando órdenes...</p>
            </div>
          </div>
        ) : selectedOrder ? (
          <OrderDetail order={selectedOrder} onBack={handleBackToList} />
        ) : (
          <OrderList onOrderClick={handleOrderClick} />
        )}
      </div>
    </div>
  );
}
