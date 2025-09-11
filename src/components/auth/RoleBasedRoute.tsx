import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
  requireAuth = true,
}) => {
  const { user, profile, loading, canAccess } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirect if user doesn't have required role
  if (requireAuth && user && !canAccess(allowedRoles)) {
    // Redirect based on user's actual role
    const redirectPath = getRedirectPath(profile?.auth_role);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Helper function to determine redirect path based on role
const getRedirectPath = (role?: UserRole): string => {
  switch (role) {
    case 'customer':
      return '/dashboard/customer';
    case 'provider':
      return '/dashboard/provider';
    case 'admin':
    case 'super_admin':
      return '/dashboard/admin';
    default:
      return '/login';
  }
};

// Convenience components for specific roles
export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles="customer">{children}</RoleBasedRoute>
);

export const ProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles="provider">{children}</RoleBasedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>{children}</RoleBasedRoute>
);

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles="super_admin">{children}</RoleBasedRoute>
);

// Public route that doesn't require authentication
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['customer', 'provider', 'admin', 'super_admin']} requireAuth={false}>
    {children}
  </RoleBasedRoute>
);