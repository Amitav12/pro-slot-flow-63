
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, User, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  payment_status: string;
  special_instructions?: string;
  services: { name: string };
  service_providers: { business_name: string; phone: string };
}

export const BookingManager = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name),
          service_providers (business_name, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-600">Monitor and manage all bookings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Bookings
          </Button>
          <Button>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { 
            title: 'Total Bookings', 
            value: bookings?.length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Pending', 
            value: bookings?.filter(b => b.status === 'pending').length || 0, 
            color: 'text-yellow-600' 
          },
          { 
            title: 'Confirmed', 
            value: bookings?.filter(b => b.status === 'confirmed').length || 0, 
            color: 'text-green-600' 
          },
          { 
            title: 'Completed', 
            value: bookings?.filter(b => b.status === 'completed').length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Total Revenue', 
            value: `$${bookings?.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0).toFixed(2)}`,
            color: 'text-green-600' 
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Booking Info */}
                <div className="lg:col-span-4">
                  <h3 className="font-semibold text-lg mb-2">{booking.services?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.booking_date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{booking.booking_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${booking.total_amount}</span>
                  </div>
                </div>

                {/* Provider Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center space-x-2 text-sm mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{booking.service_providers?.business_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{booking.service_providers?.phone}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                  <div className="space-y-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.toUpperCase()}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="lg:col-span-2">
                  {booking.special_instructions && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">Instructions:</div>
                      <div className="text-gray-600 italic">
                        "{booking.special_instructions.substring(0, 50)}..."
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:col-span-1">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
