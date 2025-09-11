import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AdminPermission {
  id: string;
  section: string;
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useAdminPermissions = () => {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, isRole } = useAuth();
  const { toast } = useToast();

  // Fetch admin permissions
  const fetchPermissions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_permissions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setPermissions(data || []);
    } catch (error: any) {
      console.error('Error fetching admin permissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update permission (Super Admin only)
  const updatePermission = async (id: string, is_enabled: boolean) => {
    if (!isRole('super_admin')) {
      toast({
        title: "Access Denied",
        description: "Only Super Admin can modify permissions",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await (supabase as any)
        .from('admin_permissions')
        .update({ 
          is_enabled, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPermissions(prev => 
        prev.map(perm => 
          perm.id === id 
            ? { ...perm, is_enabled, updated_at: new Date().toISOString() }
            : perm
        )
      );

      toast({
        title: "Success",
        description: `Permission ${is_enabled ? 'enabled' : 'disabled'} successfully`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
      return false;
    }
  };

  // Bulk update permissions
  const updateMultiplePermissions = async (updates: { id: string; is_enabled: boolean }[]) => {
    if (!isRole('super_admin')) {
      toast({
        title: "Access Denied",
        description: "Only Super Admin can modify permissions",
        variant: "destructive",
      });
      return false;
    }

    try {
      const promises = updates.map(({ id, is_enabled }) =>
        (supabase as any)
          .from('admin_permissions')
          .update({ 
            is_enabled, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check if any updates failed
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        throw new Error('Some permission updates failed');
      }

      // Update local state
      setPermissions(prev => 
        prev.map(perm => {
          const update = updates.find(u => u.id === perm.id);
          return update 
            ? { ...perm, is_enabled: update.is_enabled, updated_at: new Date().toISOString() }
            : perm;
        })
      );

      toast({
        title: "Success",
        description: `${updates.length} permissions updated successfully`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if specific section is enabled
  const isEnabled = (section: string): boolean => {
    if (!profile) return false;
    
    // Super admin always has access
    if (profile.auth_role === 'super_admin') return true;
    
    // Admin needs permission to be enabled
    if (profile.auth_role === 'admin') {
      const permission = permissions.find(p => p.section === section);
      return permission?.is_enabled || false;
    }
    
    return false;
  };

  // Get enabled sections for current user
  const getEnabledSections = (): string[] => {
    if (!profile) return [];
    
    // Super admin has access to all sections
    if (profile.auth_role === 'super_admin') {
      return permissions.map(p => p.section);
    }
    
    // Admin only gets enabled sections
    if (profile.auth_role === 'admin') {
      return permissions
        .filter(p => p.is_enabled)
        .map(p => p.section);
    }
    
    return [];
  };

  // Get permission by section
  const getPermission = (section: string): AdminPermission | undefined => {
    return permissions.find(p => p.section === section);
  };

  // Enable all permissions (Super Admin only)
  const enableAll = async () => {
    const updates = permissions.map(p => ({ id: p.id, is_enabled: true }));
    return await updateMultiplePermissions(updates);
  };

  // Disable all permissions (Super Admin only)
  const disableAll = async () => {
    const updates = permissions.map(p => ({ id: p.id, is_enabled: false }));
    return await updateMultiplePermissions(updates);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Set up real-time subscription for permission changes
  useEffect(() => {
    const subscription = supabase
      .channel('admin_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_permissions'
        },
        (payload) => {
          console.log('Admin permissions changed:', payload);
          fetchPermissions(); // Refresh permissions when they change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    permissions,
    loading,
    updatePermission,
    updateMultiplePermissions,
    isEnabled,
    getEnabledSections,
    getPermission,
    enableAll,
    disableAll,
    refetch: fetchPermissions,
  };
};