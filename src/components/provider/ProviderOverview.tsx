import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  FileText,
  Eye,
  Plus,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProviderServices } from '@/hooks/useProviderServices';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ProviderOverview = () => {
  const { services, loading: servicesLoading } = useProviderServices();
  const { categories, loading: categoriesLoading } = useCategories();
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch additional data
  useEffect(() => {
    const fetchProviderStats = async () => {
      if (!profile?.id) return;
      
      try {
        // Fetch bookings
        const { data: bookingsData } = await (supabase as any)
          .from('bookings')
          .select(`
            *,
            service:provider_services(service_name, price),
            customer:user_profiles!customer_id(full_name)
          `)
          .eq('provider_id' as any, profile.id as any)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);

        // Calculate earnings
        const totalEarnings = (bookingsData as any)?.reduce((sum: any, booking: any) => 
          booking.payment_status === 'paid' ? sum + Number(booking.total_amount) : sum, 0) || 0;
        
        const thisMonthEarnings = (bookingsData as any)?.filter((booking: any) => {
          const bookingDate = new Date(booking.created_at);
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear() &&
                 booking.payment_status === 'paid';
        }).reduce((sum: any, booking: any) => sum + Number(booking.total_amount), 0) || 0;

        setEarnings({
          total: totalEarnings,
          thisMonth: thisMonthEarnings,
          completed: (bookingsData as any)?.filter((b: any) => b.status === 'completed').length || 0,
          active: (bookingsData as any)?.filter((b: any) => ['pending', 'confirmed'].includes(b.status)).length || 0
        });

      } catch (error) {
        console.error('Error fetching provider stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProviderStats();
  }, [profile?.id]);

  // Calculate real stats from data
  const stats = {
    totalServices: services.length,
    approvedServices: services.filter(s => s.status === 'approved').length,
    pendingServices: services.filter(s => s.status === 'pending').length,
    rejectedServices: services.filter(s => s.status === 'rejected').length,
    averagePrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0,
    activeBookings: earnings.active || 0,
    monthlyEarnings: earnings.thisMonth || 0,
    completedJobs: earnings.completed || 0,
    totalEarnings: earnings.total || 0,
    rating: 4.8, // This would come from reviews
    responseTime: '2 hours' // This would be calculated from response times
  };

  // Recent bookings
  const recentBookings = bookings.slice(0, 5).map(booking => ({
    id: booking.id,
    service: booking.service?.service_name || 'Unknown Service',
    customer: booking.customer?.full_name || 'Unknown Customer',
    date: new Date(booking.booking_date).toLocaleDateString(),
    time: booking.booking_time,
    status: booking.status,
    amount: booking.total_amount
  }));

  // Profile completion check
  const profileCompletion = {
    hasServices: services.length > 0,
    hasApprovedServices: stats.approvedServices > 0,
    hasWorkingHours: services.some(s => (s as any).working_hours && Object.keys((s as any).working_hours).length > 0),
    hasLicense: services.some(s => s.license_document_url),
    hasDescription: !!(profile as any)?.bio,
    hasPhone: !!profile?.phone,
    hasAddress: !!profile?.address
  };

  const completionPercentage = Math.round(
    (Object.values(profileCompletion).filter(Boolean).length / Object.keys(profileCompletion).length) * 100
  );

  if (servicesLoading || categoriesLoading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile?.full_name || profile?.business_name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="h-3 w-3 mr-1" />
            {categories.length} Categories Available
          </Badge>
          <Badge variant="outline" className={`${completionPercentage === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            {completionPercentage}% Complete
          </Badge>
          {stats.approvedServices > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Star className="h-3 w-3 mr-1" />
              Active Provider
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Completion Alert */}
      {completionPercentage < 100 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-800">Complete Your Profile</h3>
                  <p className="text-sm text-orange-700">
                    Your profile is {completionPercentage}% complete. Complete it to attract more customers.
                  </p>
                </div>
              </div>
              <Link to="/provider/profile">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">{stats.approvedServices} approved</span>
              {stats.pendingServices > 0 && (
                <span className="text-orange-600 ml-2">• {stats.pendingServices} pending</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600">{stats.completedJobs} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">${stats.monthlyEarnings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-gray-600">Total: ${stats.totalEarnings}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Avg price: ${stats.averagePrice}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings and Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Bookings</span>
            </CardTitle>
            <Link to="/provider/bookings">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{booking.service}</h4>
                        <p className="text-xs text-gray-600">{booking.customer}</p>
                        <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">${booking.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 text-sm">Your bookings will appear here once customers start booking your services</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Your Services</span>
            </CardTitle>
            <Link to="/provider/services">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.slice(0, 5).map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{service.service_name}</h4>
                        <p className="text-xs text-gray-600">{service.subcategory?.category?.name} • {service.subcategory?.name}</p>
                        <p className="text-xs text-gray-500">Created: {new Date(service.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                        {service.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">${service.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                <p className="text-gray-600 text-sm mb-4">Start by adding your first service to attract customers</p>
                <Link to="/provider/services">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Service
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Action Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingServices > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">{stats.pendingServices} services awaiting approval</span>
                  </div>
                  <Link to="/provider/services">
                    <button className="text-xs text-yellow-600 hover:underline">View</button>
                  </Link>
                </div>
              )}
              
              {stats.rejectedServices > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{stats.rejectedServices} services need attention</span>
                  </div>
                  <Link to="/provider/services">
                    <button className="text-xs text-red-600 hover:underline">Fix</button>
                  </Link>
                </div>
              )}

              {completionPercentage < 100 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">Complete profile setup ({completionPercentage}%)</span>
                  </div>
                  <Link to="/provider/profile">
                    <button className="text-xs text-blue-600 hover:underline">Complete</button>
                  </Link>
                </div>
              )}

              {!profileCompletion.hasWorkingHours && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">Set your working hours</span>
                  </div>
                  <Link to="/provider/schedule">
                    <button className="text-xs text-orange-600 hover:underline">Update</button>
                  </Link>
                </div>
              )}

              {stats.totalServices === 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">Add your first service</span>
                  </div>
                  <Link to="/provider/services">
                    <button className="text-xs text-green-600 hover:underline">Add</button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{stats.rating}/5.0</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">{stats.responseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.completedJobs > 0 ? Math.round((stats.completedJobs / (stats.completedJobs + stats.activeBookings)) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="text-sm font-medium text-green-600">${stats.totalEarnings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profile Completion</span>
                <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};