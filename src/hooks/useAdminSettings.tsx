import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdminSettings = (key?: string) => {
  return useQuery({
    queryKey: key ? ['admin-settings', key] : ['admin-settings'],
    queryFn: async (): Promise<any> => {
      if (key) {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('key', key)
          .single();
        
        if (error) throw error;
        return data?.value || {};
      } else {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .order('key');
        
        if (error) throw error;
        
        // Convert array to object with keys as properties
        const settings: Record<string, any> = {};
        if (Array.isArray(data)) {
          data.forEach((setting: any) => {
            settings[setting.key] = setting.value;
          });
        }
        
        return settings;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};