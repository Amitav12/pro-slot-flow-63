
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { shouldBypassAdminAuth, DEV_CONFIG } from '@/config/development';

interface UserProfile {
  role: string;
  full_name: string;
  is_blocked: boolean;
}

export const useAuthAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('role, full_name, is_blocked')
          .eq('user_id', session.user.id)
          .single();
      
      setProfile((profileData as any));
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('role, full_name, is_blocked')
            .eq('user_id', session.user.id)
            .single();
        
        setProfile((profileData as any));
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // In development mode, bypass auth and provide mock admin data
  if (shouldBypassAdminAuth()) {
    const mockProfile = DEV_CONFIG.MOCK_ADMIN_USER as UserProfile;
    const mockUser = { 
      id: DEV_CONFIG.MOCK_ADMIN_USER.id, 
      email: DEV_CONFIG.MOCK_ADMIN_USER.email 
    } as User;
    
    return { 
      user: mockUser, 
      profile: mockProfile, 
      isAdmin: true, 
      loading: false 
    };
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return { user, profile, isAdmin, loading };
};
