import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users based on their role after authentication
 */
export const DashboardRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasTriedRedirect, setHasTriedRedirect] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('🔍 DashboardRedirect - Full State:', { 
        loading, 
        user: !!user, 
        userEmail: user?.email,
        profile: !!profile, 
        profileRole: profile?.auth_role || profile?.role,
        profileData: profile,
        redirectAttempts,
        isRedirecting,
        hasTriedRedirect,
        timestamp: new Date().toISOString()
      });
      
      // If still loading, wait
      if (loading) {
        console.log('⏳ DashboardRedirect - Still loading auth state...');
        return;
      }

      // If no user, redirect to auth
      if (!user) {
        console.log('❌ DashboardRedirect - No user found, redirecting to auth');
        navigate('/auth', { replace: true });
        return;
      }

      // Wait for profile to load, but be more aggressive
      if (user && !hasTriedRedirect && (profile || redirectAttempts >= 2)) {
        console.log('🚀 DashboardRedirect - User found, attempting role-based redirect...');
        setHasTriedRedirect(true);
        setIsRedirecting(true);
        
        // Determine redirect path based on role
        const role = profile?.auth_role || profile?.role || 'customer';
        let redirectPath = '/';
        
        console.log('🔍 DashboardRedirect - Detected role:', role, 'Profile data:', profile);
        
        switch (role) {
          case 'provider':
            redirectPath = '/dashboard/provider';
            console.log('🏢 DashboardRedirect - Redirecting service provider to dashboard');
            break;
          case 'admin':
            redirectPath = '/dashboard/admin';
            console.log('👨‍💼 DashboardRedirect - Redirecting admin to dashboard');
            break;
          case 'super_admin':
            redirectPath = '/dashboard/admin';
            console.log('🔑 DashboardRedirect - Redirecting super admin to dashboard');
            break;
          case 'customer':
          default:
            redirectPath = '/';
            console.log('🏠 DashboardRedirect - Redirecting customer to home page');
            break;
        }
        
        console.log('🎯 DashboardRedirect - Final redirect path:', redirectPath, 'for role:', role);
        
        // Use React Router navigation
        navigate(redirectPath, { replace: true });
      }
    };

    handleRedirect();
    
    // More aggressive retry - every 1 second instead of 2
    const attemptInterval = setInterval(() => {
      if (!hasTriedRedirect) {
        console.log('🔄 DashboardRedirect - Retry attempt:', redirectAttempts + 1);
        setRedirectAttempts(prev => prev + 1);
      }
    }, 1000);
    
    // Shorter emergency timeout - 4 seconds instead of 6
    const emergencyTimeout = setTimeout(() => {
      if (user && !hasTriedRedirect) {
        console.log('🚨 DashboardRedirect - EMERGENCY REDIRECT: Forcing redirect based on available data');
        const role = profile?.auth_role || profile?.role || 'customer';
        
        let emergencyPath = '/';
        switch (role) {
          case 'provider':
            emergencyPath = '/dashboard/provider';
            break;
          case 'admin':
          case 'super_admin':
            emergencyPath = '/dashboard/admin';
            break;
          default:
            emergencyPath = '/';
            break;
        }
        
        console.log('🚨 DashboardRedirect - Emergency redirecting to:', emergencyPath, 'for role:', role);
        navigate(emergencyPath, { replace: true });
      }
    }, 4000);

    return () => {
      clearInterval(attemptInterval);
      clearTimeout(emergencyTimeout);
    };
  }, [user, profile, loading, navigate, hasTriedRedirect, redirectAttempts]);

  const getLoadingMessage = () => {
    if (loading) return "Loading your account...";
    if (!profile && redirectAttempts > 0) return "Setting up your profile...";
    if (isRedirecting) return "Redirecting you...";
    return "Loading...";
  };

  // Manual redirect functions based on role
  const goToHomePage = () => {
    console.log('🔧 Manual redirect to home page');
    navigate('/', { replace: true });
  };

  const goToProviderDashboard = () => {
    console.log('🔧 Manual redirect to provider dashboard');
    navigate('/dashboard/provider', { replace: true });
  };

  const goToAdminDashboard = () => {
    console.log('🔧 Manual redirect to admin dashboard');
    navigate('/dashboard/admin', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Welcome to Pro Slot Flow</h2>
          <p className="text-gray-600">{getLoadingMessage()}</p>
          {redirectAttempts > 1 && (
            <p className="text-sm text-gray-500">This is taking longer than usual...</p>
          )}
        </div>
        
        {/* Manual redirect buttons after 3 seconds */}
        {redirectAttempts > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">Taking too long? Choose where to go:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={goToHomePage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Home Page
              </button>
              <button
                onClick={goToProviderDashboard}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Provider Dashboard
              </button>
              <button
                onClick={goToAdminDashboard}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Admin Dashboard
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose based on your role
            </p>
          </div>
        )}
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Loading: {loading.toString()}</p>
            <p>User: {user ? user.email : 'None'}</p>
            <p>Profile: {profile ? `${profile.auth_role || profile.role}` : 'None'}</p>
            <p>Attempts: {redirectAttempts}</p>
            <p>Redirecting: {isRedirecting.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};