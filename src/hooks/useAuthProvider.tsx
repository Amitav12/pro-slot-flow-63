import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { shouldBypassAdminAuth, DEV_CONFIG } from '@/config/development';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  address: string | null;
  business_name: string | null;
  contact_person: string | null;
  license_number: string | null;
  registration_status: string;
  license_document_url: string | null;
  id_document_url: string | null;
  onboarding_completed: boolean;
  emergency_offline: boolean;
  is_blocked: boolean;
}

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
      
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // In development mode, provide mock provider data when bypassing auth
  const effectiveProfile = shouldBypassAdminAuth() && !profile ? {
    ...DEV_CONFIG.MOCK_ADMIN_USER,
    role: 'provider',
    full_name: 'Development Provider',
    business_name: 'Dev Services LLC'
  } as any : profile;
  
  const effectiveUser = shouldBypassAdminAuth() && !user ? { 
    id: DEV_CONFIG.MOCK_ADMIN_USER.id, 
    email: 'dev-provider@localhost.com' 
  } as User : user;
  
  const effectiveAuthenticated = shouldBypassAdminAuth() ? true : !!user;

  const isCustomer = effectiveProfile?.role === 'customer';
  const isProvider = effectiveProfile?.role === 'provider';
  const isAdmin = effectiveProfile?.role === 'admin' || effectiveProfile?.role === 'super_admin';

  return {
    user: effectiveUser,
    profile: effectiveProfile,
    loading,
    signOut,
    isCustomer,
    isProvider,
    isAdmin,
    isAuthenticated: effectiveAuthenticated
  };
};