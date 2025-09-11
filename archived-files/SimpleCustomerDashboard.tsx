import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerOverview } from './CustomerOverview';
import { CustomerBookings } from './CustomerBookings';
import { CustomerFavorites } from './CustomerFavorites';
import { CustomerProfile } from './CustomerProfile';

/**
 * Simple Customer Dashboard that bypasses auth loading issues
 */
export const SimpleCustomerDashboard = () => {
  console.log('🎯 SimpleCustomerDashboard loaded - bypassing auth checks');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<CustomerOverview />} />
            <Route path="/bookings" element={<CustomerBookings />} />
            <Route path="/favorites" element={<CustomerFavorites />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="*" element={<Navigate to="/dashboard/customer" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};