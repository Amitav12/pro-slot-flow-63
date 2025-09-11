
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const DashboardRouter = () => {
  const { user, profile, loading } = useAuth();

  console.log('🔍 DashboardRouter - State:', {
    loading,
    user: !!user,
    userEmail: user?.email,
    profile: !!profile,
    profileRole: profile?.auth_role || profile?.role,
    profileData: profile
  });

  if (loading) {
    console.log('⏳ DashboardRouter - Still loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ DashboardRouter - No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Get role from auth_role or role field
  const role = profile?.auth_role || profile?.role;
  console.log('🔍 DashboardRouter - Detected role:', role);

  // Redirect based on user role with correct paths
  switch (role) {
    case 'customer':
      console.log('🏠 DashboardRouter - Redirecting customer to home page');
      return <Navigate to="/" replace />;
    case 'provider':
      console.log('🏢 DashboardRouter - Redirecting provider to dashboard');
      return <Navigate to="/dashboard/provider" replace />;
    case 'admin':
      console.log('👨‍💼 DashboardRouter - Redirecting admin to dashboard');
      return <Navigate to="/dashboard/admin" replace />;
    case 'super_admin':
      console.log('🔑 DashboardRouter - Redirecting super admin to dashboard');
      return <Navigate to="/dashboard/admin" replace />;
    default:
      console.log('❓ DashboardRouter - Unknown role, redirecting to auth. Role:', role);
      return <Navigate to="/auth" replace />;
  }
};
