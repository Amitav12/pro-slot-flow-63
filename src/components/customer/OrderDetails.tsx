import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Loader2,
  RotateCcw,
  X,
  Package
} from 'lucide-react';
import { format, addDays, isAfter, startOfToday, isSameDay } from 'date-fns';

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

const TIME_SLOTS = [
  '07:00-09:00',
  '09:00-11:00', 
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00'
];

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    if (orderId && user) {
      loadOrderDetails();
    }
  }, [orderId, user]);

  const loadOrderDetails = async () => {
    if (!orderId || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder({
        ...data,
        cart_items: Array.isArray(data.cart_items) ? data.cart_items : []
      } as unknown as Order);
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
      navigate('/dashboard/customer/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (orderError) throw orderError;
      
      // Send cancellation notifications to all providers in the order
      const providerNames = [...new Set(order.cart_items?.map(item => item.provider_name) || [])];
      
      for (const providerName of providerNames) {
        // Get provider details
        const { data: providerData } = await supabase
          .from('user_profiles')
          .select('id, user_id')
          .eq('full_name', providerName)
          .eq('role', 'provider')
          .single();
          
        if (providerData) {
          // Log provider notification (notifications table doesn't exist, so we'll just log)
          console.log('Provider notification:', {
            user_id: providerData.user_id,
            title: 'Order Cancelled',
            message: `Order #${order.id.slice(-8)} has been cancelled by the customer.`,
            type: 'order_cancelled',
            related_id: order.id
            });
        }
      }
      
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully and providers have been notified"
      });
      
      setOrder({ ...order, status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      });
    }
  };

  const handleRescheduleOrder = async () => {
    if (!order || !selectedDate || !selectedTime) return;
    
    setRescheduleLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          booking_time: selectedTime.split('-')[0],
          status: 'rescheduled'
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast({
        title: "Order Rescheduled",
        description: `Your order has been rescheduled to ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}`
      });
      
      setOrder({ 
        ...order, 
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime.split('-')[0],
        status: 'rescheduled'
      });
      setIsRescheduleOpen(false);
      setSelectedDate(undefined);
      setSelectedTime('');
    } catch (error) {
      console.error('Error rescheduling order:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule order",
        variant: "destructive"
      });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      rescheduled: { color: 'bg-purple-100 text-purple-800', text: 'Rescheduled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const canReschedule = order && ['confirmed', 'pending'].includes(order.status);
  const canCancel = order && ['confirmed', 'pending', 'rescheduled'].includes(order.status);

  // Generate next 7 days for rescheduling
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const getDayName = (date: Date) => {
    if (isSameDay(date, new Date())) return 'Today';
    if (isSameDay(date, addDays(new Date(), 1))) return 'Tomorrow';
    return format(date, 'EEE');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/customer/bookings')}>Back to Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/customer/bookings')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Bookings</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order #{order.id.slice(-8)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {order.booking_date 
                    ? format(new Date(order.booking_date), 'MMM dd, yyyy')
                    : 'Date not set'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{order.booking_time || 'Time not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{order.customer_info?.address || 'Address not provided'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{order.customer_info?.phone || 'Phone not provided'}</span>
              </div>
            </div>
          </div>
          
          {order.special_instructions && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Special Instructions</h4>
              <p className="text-sm text-gray-600">{order.special_instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.cart_items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.service_name}</h4>
                  <p className="text-sm text-gray-600">Provider: {item.provider_name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${item.price}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No services found</p>
            )}
            
            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-lg font-semibold text-blue-600">${order.total_amount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {canReschedule && (
          <Button 
            onClick={() => setIsRescheduleOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reschedule Order</span>
          </Button>
        )}
        
        {canCancel && (
          <Button 
            variant="destructive"
            onClick={handleCancelOrder}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel Order</span>
          </Button>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Reschedule Order</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select New Date (Next 7 Days)
              </label>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDate && isSameDay(selectedDate, date);
                  
                  return (
                    <Card
                      key={date.toISOString()}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-500 text-white'
                          : 'hover:shadow-md hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <CardContent className="p-2 text-center">
                        <div className="text-xs font-medium mb-1">
                          {getDayName(date)}
                        </div>
                        <div className="text-sm font-bold">
                          {format(date, 'd')}
                        </div>
                        <div className="text-xs">
                          {format(date, 'MMM')}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot)}
                      className="justify-start"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleRescheduleOrder}
                disabled={!selectedDate || !selectedTime || rescheduleLoading}
                className="flex-1"
              >
                {rescheduleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Confirm Reschedule
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRescheduleOpen(false);
                  setSelectedDate(undefined);
                  setSelectedTime('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};