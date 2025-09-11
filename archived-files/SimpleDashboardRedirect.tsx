import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, UserCheck } from 'lucide-react';

/**
 * Production-ready dashboard redirect component
 */
export const SimpleDashboardRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showManualOptions, setShowManualOptions] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If no user, go to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // If we have a user and haven't attempted redirect yet
    if (user && !redirectAttempted) {
      setRedirectAttempted(true);
      
      const role = profile?.auth_role || profile?.role || 'customer';
      const dashboardPath = `/dashboard/${role}`;
      
      // Use React Router navigation instead of window.location
      navigate(dashboardPath, { replace: true });
    }
  }, [user, profile, loading, redirectAttempted, navigate]);

  // Show manual options after 3 seconds if redirect hasn't worked
  useEffect(() => {
    if (!loading && user && !redirectAttempted) {
      const timer = setTimeout(() => {
        setShowManualOptions(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, user, redirectAttempted]);

  // Manual redirect functions
  const goToCustomer = () => {
    navigate('/dashboard/customer', { replace: true });
  };

  const goToProvider = () => {
    navigate('/dashboard/provider', { replace: true });
  };

  const getLoadingMessage = () => {
    if (loading) return 'Loading your account...';
    if (redirectAttempted) return 'Redirecting to your dashboard...';
    return 'Setting up your experience...';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Loading Animation */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Pro Slot Flow</h1>
          <p className="text-gray-600 text-lg">{getLoadingMessage()}</p>
          {user && (
            <p className="text-sm text-gray-500">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
            </p>
          )}
        </div>
        
        {/* Manual Options */}
        {showManualOptions && !loading && user && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm text-gray-700 mb-4">
                Taking longer than expected? Choose your dashboard:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={goToCustomer}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <User className="h-4 w-4" />
                  Customer Dashboard
                </button>
                <button
                  onClick={goToProvider}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <UserCheck className="h-4 w-4" />
                  Provider Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Progress Indicator */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
};