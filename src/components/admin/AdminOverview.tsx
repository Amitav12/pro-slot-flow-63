
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalProviders },
        { count: totalBookings },
        { count: pendingProviders }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('service_providers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('status', 'pending' as any)
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        totalBookings: totalBookings || 0,
        pendingProviders: pendingProviders || 0
      };
    }
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_amount,
          customer_id,
          services (name),
          service_providers (business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Providers',
      value: stats?.totalProviders || 0,
      icon: UserCheck,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingProviders || 0,
      icon: Activity,
      change: '-5%',
      changeType: 'negative'
    }
  ];

  const { data: systemMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const [
        { data: recentUsers },
        { data: pendingProviders },
        { data: activeServices },
        { data: monthlyRevenue }
      ] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, role, created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_profiles')
          .select('business_name, registration_status, created_at')
          .eq('role', 'provider')
          .eq('registration_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('provider_services')
          .select('service_name, status, price, created_at')
          .eq('status', 'approved')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select('total_amount, created_at')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      const totalRevenue = monthlyRevenue?.reduce((sum: number, booking: any) => 
        sum + (parseFloat(booking.total_amount) || 0), 0) || 0;

      return {
        recentUsers: recentUsers || [],
        pendingProviders: pendingProviders || [],
        activeServices: activeServices || [],
        monthlyRevenue: totalRevenue
      };
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Complete system overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings?.length > 0 ? (
                recentBookings.map((booking: any) => (
                  <div key={booking?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking?.service_name || 'Service'}</p>
                      <p className="text-sm text-gray-600">{booking?.provider_name || 'Provider'}</p>
                      <p className="text-xs text-gray-500">
                        {booking?.booking_date} at {booking?.booking_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${booking?.total_amount}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking?.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics?.recentUsers?.length > 0 ? (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Registrations (7 days)</h4>
                    {systemMetrics.recentUsers.slice(0, 3).map((user: any, index: number) => (
                      <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{user.full_name || 'Anonymous'}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{user.role}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pending Providers</h4>
                    {systemMetrics?.pendingProviders?.length > 0 ? (
                      systemMetrics.pendingProviders.slice(0, 3).map((provider: any, index: number) => (
                        <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-600">{provider.business_name || 'Business'}</span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No pending providers</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No activity this week</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue & Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-1">Monthly Revenue</h4>
                <div className="text-2xl font-bold text-green-900">
                  ${systemMetrics?.monthlyRevenue?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-green-700">Current month total</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Services</h4>
                {systemMetrics?.activeServices?.length > 0 ? (
                  systemMetrics.activeServices.slice(0, 3).map((service: any, index: number) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 truncate">{service.service_name}</span>
                      <span className="text-xs text-gray-500">${service.price}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No active services</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-3 text-left bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Review Pending Providers
            </button>
            <button className="w-full p-3 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Manage Categories
            </button>
            <button className="w-full p-3 text-left bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              View Analytics
            </button>
            <button className="w-full p-3 text-left bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              System Settings
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
