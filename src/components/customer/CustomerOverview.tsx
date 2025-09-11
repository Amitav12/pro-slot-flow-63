
import React from 'react';
import { Calendar, Heart, DollarSign, Star, Clock, Plus, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CustomerOverview = () => {
  const { profile, user } = useAuth();

  const stats = [
    { 
      label: 'Active Bookings', 
      value: '3', 
      icon: Calendar, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2 this week'
    },
    { 
      label: 'Favorite Services', 
      value: '8', 
      icon: Heart, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      change: '+1 new favorite'
    },
    { 
      label: 'Total Spent', 
      value: '$1,240', 
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: 'This year'
    },
    { 
      label: 'Completed Services', 
      value: '24', 
      icon: CheckCircle, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '98% satisfaction'
    },
  ];

  const recentBookings = [
    {
      id: 1,
      service: 'Premium House Cleaning',
      provider: 'Maria Garcia',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'Confirmed',
      amount: '$120',
      location: 'Downtown'
    },
    {
      id: 2,
      service: 'Plumbing Repair',
      provider: 'John Smith',
      date: '2025-01-18',
      time: '2:00 PM',
      status: 'Pending',
      amount: '$85',
      location: 'Home'
    },
    {
      id: 3,
      service: 'Garden Maintenance',
      provider: 'Green Thumb Co.',
      date: '2025-01-20',
      time: '9:00 AM',
      status: 'Confirmed',
      amount: '$150',
      location: 'Backyard'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Welcome back, {profile?.full_name || user?.user_metadata?.full_name || 'User'}!
              </h1>
              <p className="text-blue-100 text-lg mb-6 max-w-2xl">
                Manage your bookings, discover amazing services, and track your service history all in one place.
              </p>
              <Button 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Book New Service
              </Button>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Upcoming Bookings
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Your scheduled services and appointments
              </p>
            </div>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              View All Bookings
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <Calendar className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {booking.service}
                      </h4>
                      <p className="text-gray-600 font-medium mb-2">
                        with {booking.provider}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </div>
                        <span>•</span>
                        <span>{booking.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-3 mt-4 sm:mt-0">
                    <Badge className={`${getStatusColor(booking.status)} border font-medium`}>
                      {booking.status}
                    </Badge>
                    <p className="text-xl font-bold text-gray-900">
                      {booking.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No upcoming bookings
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start exploring our amazing services to make your first booking and experience quality service delivery.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Browse Services
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
