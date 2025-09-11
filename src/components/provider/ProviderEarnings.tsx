import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProviderEarnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock earnings data
  const earnings = {
    total: 4250,
    thisMonth: 1850,
    pending: 320,
    available: 1530,
    growth: 15.2
  };

  const transactions = [
    {
      id: '1',
      service: 'Emergency Plumbing Repair',
      customer: 'John Smith',
      date: '2025-09-02',
      amount: 150,
      status: 'completed',
      commission: 15,
      net: 135
    },
    {
      id: '2',
      service: 'HVAC Maintenance',
      customer: 'Mike Wilson',
      date: '2025-09-01',
      amount: 200,
      status: 'completed',
      commission: 20,
      net: 180
    },
    {
      id: '3',
      service: 'Electrical Installation',
      customer: 'Sarah Johnson',
      date: '2025-08-30',
      amount: 300,
      status: 'pending',
      commission: 30,
      net: 270
    },
    {
      id: '4',
      service: 'Plumbing Inspection',
      customer: 'Emily Davis',
      date: '2025-08-28',
      amount: 100,
      status: 'completed',
      commission: 10,
      net: 90
    }
  ];

  const monthlyData = [
    { month: 'Jan', earnings: 2100 },
    { month: 'Feb', earnings: 2350 },
    { month: 'Mar', earnings: 2800 },
    { month: 'Apr', earnings: 3200 },
    { month: 'May', earnings: 2900 },
    { month: 'Jun', earnings: 3400 },
    { month: 'Jul', earnings: 3800 },
    { month: 'Aug', earnings: 4100 },
    { month: 'Sep', earnings: 1850 } // Current month (partial)
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your income and payment history</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${earnings.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{earnings.growth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">${earnings.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600">12 completed jobs</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${earnings.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600">Processing payment</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">${earnings.available}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">Ready for withdrawal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Earnings Trend</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('year')}
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                  style={{
                    height: `${(data.earnings / Math.max(...monthlyData.map(d => d.earnings))) * 200}px`,
                    minHeight: '20px'
                  }}
                />
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.service}</h4>
                    <p className="text-sm text-gray-600">Customer: {transaction.customer}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${transaction.amount}</p>
                    <p className="text-sm text-gray-600">Commission: ${transaction.commission}</p>
                    <p className="text-sm font-medium text-green-600">Net: ${transaction.net}</p>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payout Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next Payout</span>
                <span className="font-medium text-gray-900">September 15, 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payout Amount</span>
                <span className="font-medium text-green-600">${earnings.available}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payout Method</span>
                <span className="font-medium text-gray-900">Bank Transfer</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Request Early Payout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Job Value</span>
                <span className="font-medium text-gray-900">$187</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs This Month</span>
                <span className="font-medium text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Commission Rate</span>
                <span className="font-medium text-gray-900">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <span className="font-medium text-gray-900">⭐ 4.8/5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};