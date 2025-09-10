
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Filter, Search, Plus, Download, RotateCcw, X, Eye, Phone, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  service_name: string;
  provider_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  customer_address: string;
  special_instructions?: string;
  cart_items: any[] | string;
  customer_phone?: string;
}

export const CustomerBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
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
        description: "Failed to load your bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking cancelled successfully"
      });
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error", 
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✓';
      case 'confirmed':
        return '●';
      case 'pending':
        return '○';
      case 'cancelled':
        return '✕';
      default:
        return '○';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: orders.length,
    Pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
    Confirmed: orders.filter(o => o.status.toLowerCase() === 'confirmed').length,
    Completed: orders.filter(o => o.status.toLowerCase() === 'completed').length,
    Cancelled: orders.filter(o => o.status.toLowerCase() === 'cancelled').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage your service appointments and track their progress
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Book New Service
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings or providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`${
                    statusFilter === status 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status} ({count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {order.service_name}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            with {order.provider_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(order.booking_date).toLocaleDateString()} at {order.booking_time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {order.customer_address}
                        </div>
                      </div>

                      {order.special_instructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Instructions:</strong> {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <Badge className={`${getStatusColor(order.status)} border font-medium px-3 py-1`}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </Badge>
                    <p className="text-2xl font-bold text-gray-900">
                      ${order.total_amount}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Service Information</h4>
                                  <p><strong>Service:</strong> {selectedOrder.service_name}</p>
                                  <p><strong>Provider:</strong> {selectedOrder.provider_name}</p>
                                  <p><strong>Date:</strong> {new Date(selectedOrder.booking_date).toLocaleDateString()}</p>
                                  <p><strong>Time:</strong> {selectedOrder.booking_time}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Payment Information</h4>
                                  <p><strong>Total Amount:</strong> ${selectedOrder.total_amount}</p>
                                  <p><strong>Status:</strong> <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
                                </div>
                              </div>
                              
                              {selectedOrder.cart_items && Array.isArray(selectedOrder.cart_items) && selectedOrder.cart_items.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Services Included</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.cart_items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                          <p className="font-medium">{item.service_name || item.serviceName || 'Service'}</p>
                                          <p className="text-sm text-gray-600">Provider: {item.provider_name || item.providerName || 'Provider'}</p>
                                        </div>
                                        <p className="font-semibold">${item.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {selectedOrder.special_instructions && (
                                <div>
                                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                                  <p className="text-gray-600">{selectedOrder.special_instructions}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {order.status.toLowerCase() === 'confirmed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {order.status.toLowerCase() === 'completed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Plus className="h-4 w-4 mr-1" />
                            Book Again
                          </Button>
                        </>
                      )}
                      {order.status.toLowerCase() === 'pending' && (
                        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                          <Clock className="h-4 w-4 mr-1" />
                          Awaiting Confirmation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start exploring our services to make your first booking.'
                }
              </p>
              {searchTerm || statusFilter !== 'All' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Browse Services
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
