import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const SyncedCustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Dashboard</h1>
        <p className="text-gray-600">Welcome to your synced customer dashboard.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Bookings</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeBookings}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.completedBookings}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SyncedCustomerDashboard;