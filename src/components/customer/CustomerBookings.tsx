import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Loader2,
  Eye,
  RotateCcw,
  X
} from 'lucide-react';
import { format, isAfter, startOfToday } from 'date-fns';

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  customer_address: string;
  customer_phone: string;
  cart_items: any[];
  special_instructions?: string;
  customer_info?: any;
}

export const CustomerBookings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRebookOpen, setIsRebookOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedBookings = (data || []).map((order: any) => ({
        ...order,
        cart_items: Array.isArray(order.cart_items) ? order.cart_items : []
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
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

      await loadBookings();
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

  const handleRebook = async () => {
    if (!selectedBooking || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for rebooking",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          booking_time: selectedTime,
          status: 'confirmed',
          booking_status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      await loadBookings();
      setIsRebookOpen(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedBooking(null);
      
      toast({
        title: "Success",
        description: "Booking rescheduled successfully",
      });
    } catch (error) {
      console.error('Error rebooking:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule booking",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const canCancelOrRebook = (booking: Booking) => {
    const bookingDate = new Date(booking.booking_date);
    const today = startOfToday();
    return isAfter(bookingDate, today) && (booking.status === 'confirmed' || booking.status === 'pending');
  };

  const canRebookFromDate = (booking: Booking) => {
    return new Date(booking.booking_date);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage your service appointments</p>
        </div>
        <Button onClick={() => window.location.href = '/'}>
          + Book Service
        </Button>
      </div>

      {bookings.length === 0 ? (
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
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(booking.status)}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{booking.service_name}</h3>
                      <p className="text-gray-600">{booking.provider_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-lg font-bold text-gray-900 mt-1">${booking.total_amount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{booking.booking_date} at {booking.booking_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.customer_address || 'Address not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{booking.customer_phone || 'Phone not provided'}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {/* View Details Button */}
                  <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl">
                      <DialogHeader className="text-center pb-6">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Booking Details
                        </DialogTitle>
                      </DialogHeader>
                     {selectedBooking && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 shadow-lg">
                            <div>
                              <h4 className="font-medium text-slate-800">Date & Time</h4>
                              <p className="text-slate-700 text-lg">{selectedBooking.booking_date} at {selectedBooking.booking_time}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">Total Amount</h4>
                              <p className="text-2xl font-bold text-emerald-600">${selectedBooking.total_amount}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-4 text-slate-800 text-lg">Services Booked</h4>
                            <div className="space-y-4">
                              {selectedBooking.cart_items && selectedBooking.cart_items.length > 0 ? (
                                selectedBooking.cart_items.map((item: any, index: number) => (
                                  <div key={index} className="rounded-xl p-6 bg-gradient-to-r from-emerald-100 to-blue-100 border border-emerald-300 hover-scale transition-all duration-300 shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="font-semibold text-xl text-slate-800">{item.service_name || selectedBooking.service_name}</p>
                                        <p className="text-slate-600 text-lg">Provider: {item.provider_name || selectedBooking.provider_name}</p>
                                        <p className="text-slate-600">Quantity: {item.quantity || 1}</p>
                                      </div>
                                      <p className="font-bold text-2xl text-emerald-600">${item.price || selectedBooking.total_amount}</p>
                                    </div>
                                    
                                    {/* Individual service actions */}
                                    {canCancelOrRebook(selectedBooking) && (
                                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-300">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                                          onClick={() => {
                                            setSelectedBooking(selectedBooking);
                                            setIsDetailsOpen(false);
                                            setIsRebookOpen(true);
                                          }}
                                        >
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          Reschedule This Service
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-none hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                                          onClick={() => {
                                            handleCancelBooking(selectedBooking.id);
                                            setIsDetailsOpen(false);
                                          }}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Cancel This Service
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-xl p-6 bg-gradient-to-r from-slate-100 to-blue-100 border border-slate-300 shadow-md">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold text-xl text-slate-800">{selectedBooking.service_name}</p>
                                      <p className="text-slate-600 text-lg">Provider: {selectedBooking.provider_name}</p>
                                    </div>
                                    <p className="font-bold text-2xl text-emerald-600">${selectedBooking.total_amount}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedBooking.special_instructions && (
                            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 shadow-md">
                              <h4 className="font-semibold text-slate-800 text-lg">Special Instructions</h4>
                              <p className="text-slate-700 mt-2 text-base">{selectedBooking.special_instructions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Rebook Button */}
                  {canCancelOrRebook(booking) && (
                    <Dialog open={isRebookOpen} onOpenChange={setIsRebookOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-md bg-gradient-to-br from-slate-50 to-blue-100 border-0 shadow-2xl">
                      <DialogHeader className="text-center pb-6">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Reschedule Booking
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                          <Label className="text-base font-semibold text-slate-700 mb-4 block">Select New Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => !isAfter(date, canRebookFromDate(booking))}
                            className="rounded-lg border-2 border-blue-200 bg-white shadow-md pointer-events-auto w-full"
                          />
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
                          <Label htmlFor="time" className="text-base font-semibold text-slate-700 mb-4 block">Select Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="bg-white border-2 border-blue-200 focus:border-purple-400 focus:ring-purple-200 text-lg p-3"
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsRebookOpen(false)}
                            className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleRebook} 
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Reschedule
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                    </Dialog>
                  )}

                  {/* Cancel Button */}
                  {canCancelOrRebook(booking) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};