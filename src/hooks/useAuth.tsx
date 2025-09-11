import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { SecureStorage, SecureSessionData } from '@/utils/secureStorage';

// Types for our authentication system
export type UserRole = 'customer' | 'provider' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  auth_role: UserRole;
  role: UserRole;
  business_name?: string | null;
  phone?: string | null;
  registration_status?: 'pending' | 'approved' | 'rejected';
  license_number?: string | null;
  address?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isProvider: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (section: string) => boolean;
  isRole: (role: UserRole) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
  // Enhanced security methods
  secureSignOut: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  getSecureSession: () => SecureSessionData | null;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('user_id' as any, userId as any)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return (data as any);
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Initialize auth state - WITH SECURE SESSION MANAGEMENT
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing secure authentication...');
        
        // Check for existing secure session first
        const secureSession = SecureStorage.getSession();
        
        if (secureSession && !('needsRevalidation' in secureSession)) {
          console.log('🔍 Secure session found, validating against database...');
          
          // Always validate against current Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && session.user.id === secureSession.userId) {
            setUser(session.user);
            
            // CRITICAL: Always fetch fresh profile from database to prevent role confusion
            const freshProfile = await fetchProfile(session.user.id);
            
            if (freshProfile) {
              // Verify the cached role matches the database role
              const dbRole = freshProfile.auth_role || freshProfile.role;
              
              if (dbRole === secureSession.role) {
                setProfile(freshProfile);
                console.log('✅ Session validated - roles match:', { cached: secureSession.role, database: dbRole });
                setLoading(false);
                return;
              } else {
                console.warn('⚠️ Role mismatch detected! Cached:', secureSession.role, 'Database:', dbRole);
                console.log('🔄 Updating secure session with correct role...');
                
                // Update secure session with correct role
                const correctedSession = {
                  ...secureSession,
                  role: dbRole,
                  lastValidated: Date.now()
                };
                
                SecureStorage.setSession(correctedSession);
                setProfile(freshProfile);
                console.log('✅ Session corrected with database role:', dbRole);
                setLoading(false);
                return;
              }
            } else {
              console.warn('⚠️ No profile found in database, clearing secure storage');
              SecureStorage.clearSession();
            }
          } else {
            console.warn('⚠️ Session user mismatch, clearing secure storage');
            SecureStorage.clearSession();
          }
        }
        
        // Fallback to regular session initialization
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch actual user profile from database
          const userProfile = await fetchProfile(session.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
            console.log('✅ User profile loaded:', { role: userProfile.role, auth_role: userProfile.auth_role });
            
            // Store in secure session
            const sessionData: SecureSessionData = {
              userId: session.user.id,
              role: userProfile.auth_role || userProfile.role,
              email: session.user.email || '',
              sessionId: session.access_token.substring(0, 32),
              expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
              lastValidated: Date.now()
            };
            
            SecureStorage.setSession(sessionData);
            console.log('✅ Secure session created');
          } else {
            // Create default profile if none exists
            console.log('⚠️ No profile found, creating default customer profile');
            const defaultProfile = {
              id: session.user.id,
              user_id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'User',
              auth_role: 'customer' as UserRole,
              role: 'customer' as UserRole,
              business_name: null,
              phone: session.user.user_metadata?.phone || null,
              onboarding_completed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setProfile(defaultProfile);
            
            // Store default session
            const sessionData: SecureSessionData = {
              userId: session.user.id,
              role: 'customer',
              email: session.user.email || '',
              sessionId: session.access_token.substring(0, 32),
              expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
              lastValidated: Date.now()
            };
            
            SecureStorage.setSession(sessionData);
          }
        } else {
          console.log('❌ No active session found');
          SecureStorage.clearSession();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        SecureStorage.clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('🔐 SIGNED_OUT event detected, clearing all auth data');
        
        // Clear all local state immediately
        setUser(null);
        setProfile(null);
        
        // Clear secure storage
        SecureStorage.clearSession();
        
        // Clear all browser storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('✅ All auth data cleared on sign out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });

    if (error) {
      throw error;
    }

    if (data.user && data.session) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        setProfile(profile);
      }
    }
  };

  // Enhanced sign out function
  const signOut = async () => {
    try {
      console.log('🔐 Performing standard sign out...');
      
      // Clear secure storage first
      SecureStorage.clearSession();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      console.log('✅ Standard sign out completed');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force clear even if server sign out fails
      SecureStorage.clearSession();
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  // Enhanced security methods
  const secureSignOut = async (): Promise<void> => {
    try {
      console.log('🔐 Performing secure sign out...');
      
      SecureStorage.clearSession();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Secure sign out completed');
    } catch (error) {
      console.error('Secure sign out failed:', error);
      SecureStorage.clearSession();
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const secureSession = SecureStorage.getSession();
      
      if (!secureSession) {
        return false;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session || session.user.id !== secureSession.userId) {
        SecureStorage.clearSession();
        return false;
      }
      
      SecureStorage.updateLastValidated();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  const getSecureSession = (): SecureSessionData | null => {
    return SecureStorage.getSession();
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        SecureStorage.clearSession();
        return false;
      }
      
      const currentSecureSession = SecureStorage.getSession();
      
      if (currentSecureSession) {
        const updatedSession: SecureSessionData = {
          ...currentSecureSession,
          sessionId: session.access_token.substring(0, 32),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
          lastValidated: Date.now()
        };
        
        SecureStorage.setSession(updatedSession);
      }
      
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('user_id' as any, user.id as any);

    if (error) {
      throw error;
    }

    const updatedProfile = await fetchProfile(user.id);
    setProfile(updatedProfile);
  };

  // Permission checking functions
  const hasPermission = (section: string): boolean => {
    if (!profile) return false;
    
    if (profile.auth_role === 'super_admin') return true;
    if (profile.auth_role !== 'admin') return false;
    
    console.debug('Checking permission for section:', section);
    return true;
  };

  const isRole = (role: UserRole): boolean => {
    return profile?.auth_role === role;
  };

  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (profile.auth_role === 'super_admin') return true;
    
    return roles.includes(profile.auth_role);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.auth_role === 'admin' || profile?.auth_role === 'super_admin',
    isCustomer: profile?.auth_role === 'customer',
    isProvider: profile?.auth_role === 'provider',
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    isRole,
    canAccess,
    // Enhanced security methods
    secureSignOut,
    validateSession,
    getSecureSession,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};