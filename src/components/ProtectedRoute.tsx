
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { shouldBypassAdminAuth } from '@/config/development';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/' 
}) => {
  const { isAuthenticated, profile, loading } = useAuth();

  // Bypass authentication for admin/superadmin/provider in development
  if (shouldBypassAdminAuth() && (requiredRole === 'admin' || requiredRole === 'super_admin' || requiredRole === 'provider')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole) {
    // For admin routes, allow both admin and super_admin roles
    if (requiredRole === 'admin' && profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return <Navigate to={fallbackPath} replace />;
    }
    // For other roles, exact match required
    else if (requiredRole !== 'admin' && profile?.role !== requiredRole) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};
