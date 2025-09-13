import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Loader2,
  Package,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  service_name: string;
  provider_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  cart_items: OrderItem[];
  customer_info: {
    name: string;
    phone: string;
    address: string;
  };
  booking_date?: string;
  booking_time?: string;
  special_instructions?: string;
  created_at: string;
}

export const CustomerBookings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedOrders = (data || []).map((order: any) => ({
        ...order,
        cart_items: Array.isArray(order.cart_items) ? order.cart_items : []
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          booking_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      await loadOrders();
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getServicesSummary = (cartItems: OrderItem[]) => {
    if (!cartItems || cartItems.length === 0) return 'No services';
    if (cartItems.length === 1) return cartItems[0].service_name;
    return `${cartItems[0].service_name} +${cartItems.length - 1} more`;
  };

  const getProvidersSummary = (cartItems: OrderItem[]) => {
    if (!cartItems || cartItems.length === 0) return 'No provider';
    const uniqueProviders = [...new Set(cartItems.map(item => item.provider_name))];
    if (uniqueProviders.length === 1) return uniqueProviders[0];
    return `${uniqueProviders[0]} +${uniqueProviders.length - 1} more`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };



  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/customer')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
            <p className="text-gray-600">Manage your service appointments</p>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/'}>
          + Book Service
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start booking services to see your appointments here</p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                       <h3 className="font-semibold text-lg text-gray-900">{getServicesSummary(order.cart_items)}</h3>
                       <p className="text-gray-600">{getProvidersSummary(order.cart_items)}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-bold text-gray-900 mt-1">${order.total_amount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <CalendarIcon className="h-4 w-4" />
                     <span>
                       {order.booking_date 
                         ? `${format(new Date(order.booking_date), 'MMM dd, yyyy')} at ${order.booking_time || 'Time TBD'}` 
                         : 'Date & Time TBD'
                       }
                     </span>
                   </div>
                   <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <MapPin className="h-4 w-4" />
                     <span>{order.customer_info?.address || 'Address not provided'}</span>
                   </div>
                   <div className="flex items-center space-x-2 text-sm text-gray-600">
                     <Phone className="h-4 w-4" />
                     <span>{order.customer_info?.phone || 'Phone not provided'}</span>
                   </div>
                 </div>

                <div className="flex justify-end space-x-2">
                  {/* View Details Button */}
                  <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => navigate(`/dashboard/customer/orders/${order.id}`)}
                     className="flex items-center space-x-2"
                   >
                     <Package className="h-4 w-4" />
                     <span>View Order</span>
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};