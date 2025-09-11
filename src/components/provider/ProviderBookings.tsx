import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProviderBookings = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock bookings data - replace with real data from hooks
  const bookings = [
    {
      id: '1',
      service: 'Emergency Plumbing Repair',
      customer: {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001'
      },
      date: '2025-09-03',
      time: '10:00 AM',
      status: 'confirmed',
      amount: 150,
      notes: 'Kitchen sink is leaking, urgent repair needed',
      created_at: '2025-09-01T10:00:00Z'
    },
    {
      id: '2',
      service: 'Electrical Installation',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Ave, Los Angeles, CA 90210'
      },
      date: '2025-09-04',
      time: '2:00 PM',
      status: 'pending',
      amount: 300,
      notes: 'Install new ceiling fan in living room',
      created_at: '2025-09-02T14:30:00Z'
    },
    {
      id: '3',
      service: 'HVAC Maintenance',
      customer: {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+1 (555) 456-7890',
        address: '789 Pine Rd, Chicago, IL 60601'
      },
      date: '2025-09-02',
      time: '9:00 AM',
      status: 'completed',
      amount: 200,
      notes: 'Regular maintenance check and filter replacement',
      created_at: '2025-08-30T09:15:00Z'
    },
    {
      id: '4',
      service: 'Plumbing Inspection',
      customer: {
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+1 (555) 321-0987',
        address: '321 Elm St, Miami, FL 33101'
      },
      date: '2025-09-05',
      time: '11:00 AM',
      status: 'cancelled',
      amount: 100,
      notes: 'Pre-purchase home inspection',
      created_at: '2025-09-01T16:45:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const handleAcceptBooking = (bookingId: string) => {
    console.log('Accept booking:', bookingId);
    // Implement accept booking logic
  };

  const handleRejectBooking = (bookingId: string) => {
    console.log('Reject booking:', bookingId);
    // Implement reject booking logic
  };

  const handleCompleteBooking = (bookingId: string) => {
    console.log('Complete booking:', bookingId);
    // Implement complete booking logic
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your service bookings and appointments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filterBookings(activeTab).map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(booking.status)}
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{booking.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{booking.customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{booking.customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.customer.address}</span>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-green-600">${booking.amount}</span>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBooking(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectBooking(booking.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteBooking(booking.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Complete
                        </Button>
                      )}

                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterBookings(activeTab).length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab === 'all' ? '' : activeTab} bookings
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' 
                      ? 'You don\'t have any bookings yet. Start promoting your services!'
                      : `No ${activeTab} bookings at the moment.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};