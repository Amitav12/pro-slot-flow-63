// Enhanced route guard with server-side validation and session management
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { SecureStorage, SecureSessionData } from '@/utils/secureStorage';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecureRouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
  sessionData: SecureSessionData | null;
}

export const SecureRouteGuard: React.FC<SecureRouteGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  fallbackPath = '/auth'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: true,
    isValid: false,
    error: null,
    sessionData: null
  });

  const allowedRoleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Server-side session validation
  const validateSessionWithServer = async (sessionData: SecureSessionData): Promise<boolean> => {
    try {
      console.log('🔐 Validating session with server...');
      
      // Get current user session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('❌ Server session validation failed:', error?.message);
        return false;
      }

      // Validate session integrity
      if (session.user.id !== sessionData.userId) {
        console.warn('❌ Session user ID mismatch');
        return false;
      }

      // Fetch fresh user profile to validate role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, auth_role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.warn('❌ Failed to fetch user profile for validation');
        return false;
      }

      // Type-safe access to profile data
      const serverRole = profileData.auth_role || profileData.role;
      
      // Validate role matches stored session
      if (serverRole !== sessionData.role) {
        console.warn('❌ Role mismatch detected:', { stored: sessionData.role, server: serverRole });
        return false;
      }

      console.log('✅ Server session validation successful');
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return false;
    }
  };

  // Main validation logic
  useEffect(() => {
    const performValidation = async () => {
      // Prevent validation if already redirecting
      if (validationState.sessionData && !validationState.isValid) {
        return;
      }
      
      // Prevent re-validation if already valid and not validating
      if (validationState.isValid && !validationState.isValidating) {
        return;
      }
      
      // Allow initial validation but prevent concurrent validations
      if (validationState.isValidating && validationState.sessionData) {
        return;
      }

      setValidationState(prev => ({ ...prev, isValidating: true, error: null }));

      try {
        // Check if authentication is required
        if (!requireAuth) {
          setValidationState({
            isValidating: false,
            isValid: true,
            error: null,
            sessionData: null
          });
          return;
        }

        // Get stored session
        const storedSession = SecureStorage.getSession();
        
        if (!storedSession) {
          console.log('❌ No stored session found');
          setValidationState({
            isValidating: false,
            isValid: false,
            error: 'No valid session found',
            sessionData: null
          });
          return;
        }

        // Check if session needs revalidation
        if ('needsRevalidation' in storedSession) {
          console.log('🔄 Session needs revalidation');
          
          const isServerValid = await validateSessionWithServer(storedSession);
          
          if (!isServerValid) {
            SecureStorage.clearSession();
            setValidationState({
              isValidating: false,
              isValid: false,
              error: 'Session validation failed',
              sessionData: null
            });
            return;
          }

          // Update validation timestamp
          SecureStorage.updateLastValidated();
        }

        // Enhanced role authorization with cached database validation
        const cachedRole = storedSession.role;
        
        // Only perform database validation if session hasn't been validated recently (5 minutes)
        const lastValidated = storedSession.lastValidated || 0;
        const validationAge = Date.now() - lastValidated;
        const VALIDATION_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
        
        if (validationAge > VALIDATION_CACHE_TIME) {
          console.log('🔍 Performing periodic database role validation...');
          
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: currentProfileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role, auth_role')
                .eq('user_id', session.user.id)
                .single();
                
              if (!profileError && currentProfileData) {
                const currentDbRole = currentProfileData.auth_role || currentProfileData.role;
                
                // Critical: Verify cached role matches current database role
                if (cachedRole !== currentDbRole) {
                  console.error('🚨 CRITICAL: Role mismatch detected!');
                  console.error('   Cached role:', cachedRole);
                  console.error('   Database role:', currentDbRole);
                  console.error('   This indicates a security issue - clearing session');
                  
                  // Clear potentially compromised session
                  SecureStorage.clearSession();
                  
                  setValidationState({
                    isValidating: false,
                    isValid: false,
                    error: 'Security validation failed - session cleared',
                    sessionData: null
                  });
                  return;
                } else {
                  // Update validation timestamp to prevent repeated checks
                  SecureStorage.updateLastValidated();
                  console.log('✅ Database role validation passed, cache updated');
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Database validation failed, proceeding with cached role:', error);
            // Continue with cached role if database check fails
          }
        }
        
        const userRole = cachedRole;
        const hasAccess = allowedRoleArray.includes(userRole);

        if (!hasAccess) {
          console.warn('❌ Access denied for role:', userRole, 'Required:', allowedRoleArray);
          console.warn('🔒 Enforcing strict role-based access control');
          
          // Only set invalid state once to prevent infinite loops
          if (validationState.isValid !== false || !validationState.sessionData) {
            setValidationState({
              isValidating: false,
              isValid: false,
              error: `Access denied. Required role: ${allowedRoleArray.join(' or ')}. Current role: ${userRole}`,
              sessionData: storedSession
            });
          }
          return;
        }

        console.log('✅ Route access granted for role:', userRole, 'to access:', allowedRoleArray);
        setValidationState({
          isValidating: false,
          isValid: true,
          error: null,
          sessionData: storedSession
        });

      } catch (error) {
        console.error('❌ Validation error:', error);
        setValidationState({
          isValidating: false,
          isValid: false,
          error: 'Validation failed',
          sessionData: null
        });
      }
    };

    performValidation();
  }, [user, profile, loading, allowedRoleArray, requireAuth]);

  // Show loading state
  if (loading || validationState.isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Securing Your Access</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle validation errors
  if (!validationState.isValid) {
    // If user has a session but wrong role, redirect to their correct dashboard
    if (validationState.sessionData) {
      const correctPath = `/dashboard/${validationState.sessionData.role}`;
      console.log('🔄 Redirecting to correct dashboard:', correctPath);
      return <Navigate to={correctPath} replace />;
    }

    // No session or validation failed, redirect to auth
    console.log('🔄 Redirecting to auth page');
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  // Access granted, render children
  return (
    <>
      {children}
      {/* Security monitoring component */}
      <SecurityMonitor sessionData={validationState.sessionData} />
    </>
  );
};

// Security monitoring component for session management
const SecurityMonitor: React.FC<{ sessionData: SecureSessionData | null }> = ({ sessionData }) => {
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check for logging out state in storage
    const checkLoggingOutState = () => {
      const loggingOutState = localStorage.getItem('isLoggingOut');
      if (loggingOutState === 'true') {
        setIsLoggingOut(true);
        console.log('🔐 Logout in progress - stopping all security monitoring');
        return true;
      }
      return false;
    };

    // Only monitor if we have valid session data and not logging out
    if (!sessionData || checkLoggingOutState()) {
      console.log('🔐 No session data or logout in progress - stopping security monitoring');
      return;
    }

    console.log('🔐 Starting security monitoring for session:', sessionData.sessionId.substring(0, 8) + '...');

    // Monitor for session tampering
    const monitorSession = () => {
      // Check if logout is in progress
      if (checkLoggingOutState()) {
        console.log('🔐 Logout detected during monitoring - stopping immediately');
        return;
      }

      const currentSession = SecureStorage.getSession();
      
      // If no current session, user has signed out - stop monitoring
      if (!currentSession) {
        console.log('🔐 Session cleared - stopping security monitoring');
        return;
      }
      
      if (currentSession.sessionId !== sessionData.sessionId) {
        console.warn('🚨 Session tampering detected!');
        setShowSecurityAlert(true);
        
        // Auto-logout after security breach
        setTimeout(() => {
          SecureStorage.clearSession();
          window.location.href = '/auth';
        }, 3000);
      }
    };

    // Check immediately
    monitorSession();
    
    // Check every 30 seconds
    const interval = setInterval(() => {
      if (!checkLoggingOutState()) {
        monitorSession();
      }
    }, 30000);
    
    return () => {
      console.log('🔐 Cleaning up security monitoring interval');
      clearInterval(interval);
    };
  }, [sessionData]);

  // Listen for logout events to stop monitoring immediately
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggingOut' && e.newValue === 'true') {
        console.log('🔐 Logout event detected - stopping security monitoring immediately');
        setIsLoggingOut(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (showSecurityAlert) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Security breach detected. Logging out for your safety...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

// Convenience components for specific roles
export const SecureCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles="customer">{children}</SecureRouteGuard>
);

export const SecureProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles="provider">{children}</SecureRouteGuard>
);

export const SecureAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SecureRouteGuard allowedRoles={['admin', 'super_admin']}>{children}</SecureRouteGuard>
);

export default SecureRouteGuard;