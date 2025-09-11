import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreateProviderServiceData } from '@/types/categories';
import { useToast } from '@/hooks/use-toast';

// Simple interface that matches the actual database structure
interface ProviderServiceData {
  id: string;
  provider_id: string;
  subcategory_id: string;
  service_name: string;
  description: string | null;
  price: number;
  license_number: string | null;
  license_document_url: string | null;
  working_hours?: any;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  approval_notes?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
  subcategory?: {
    id: string;
    name: string;
    description: string;
    min_price: number;
    max_price: number;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  };
  provider?: {
    id: string;
    full_name: string | null;
    business_name: string | null;
  };
}

export const useProviderServices = (providerId?: string) => {
  const [services, setServices] = useState<ProviderServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      let targetProviderId = providerId;
      
      // If no providerId provided, get current user's provider ID
      if (!targetProviderId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Use raw query to bypass type checking
          const { data: profile, error: profileError } = await (supabase as any)
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setServices([]);
            return;
          }
          
          if (profile && 'id' in profile) {
            targetProviderId = profile.id;
          }
        }
      }

      if (!targetProviderId) {
        setServices([]);
        return;
      }

      // Use raw query to bypass type checking
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .eq('provider_id', targetProviderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data safely using unknown first
      setServices((data as unknown as ProviderServiceData[]) || []);
    } catch (error: any) {
      console.error('Error fetching provider services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch provider services",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: CreateProviderServiceData) => {
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use raw query to bypass type checking
      const { data: profile, error: profileError } = await (supabase as any)
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile || !('id' in profile)) {
        throw new Error('Profile not found');
      }

      // Check subcategory price limits using raw query
      const { data: subcategory, error: subcategoryError } = await (supabase as any)
        .from('subcategories')
        .select('min_price, max_price')
        .eq('id', serviceData.subcategory_id)
        .single();

      if (!subcategoryError && subcategory && 'min_price' in subcategory && 'max_price' in subcategory) {
        if (serviceData.price < subcategory.min_price || serviceData.price > subcategory.max_price) {
          throw new Error(`Price must be between ${subcategory.min_price} and ${subcategory.max_price}`);
        }
      }

      // Prepare the insert data - use any to bypass strict typing
      const insertData: any = {
        provider_id: profile.id,
        subcategory_id: serviceData.subcategory_id,
        service_name: serviceData.service_name,
        description: serviceData.description || null,
        price: serviceData.price,
        license_number: serviceData.license_number || null,
        license_document_url: serviceData.license_document_url || null,
        status: 'pending',
        is_active: true
      };

      // Add working_hours if provided
      if (serviceData.working_hours) {
        insertData.working_hours = serviceData.working_hours;
      }

      // Use raw query to bypass type checking
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .insert([insertData])
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .single();

      if (error) throw error;

      // Transform the response data safely
      const newService = data as unknown as ProviderServiceData;

      setServices(prev => [newService, ...prev]);
      toast({
        title: "Success",
        description: "Service registered successfully and pending admin approval",
      });
      return newService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<CreateProviderServiceData>) => {
    try {
      // Check price limits if price is being updated
      if (updates.price !== undefined) {
        const service = services.find(s => s.id === id);
        if (service?.subcategory) {
          const { min_price, max_price } = service.subcategory;
          if (updates.price < min_price || updates.price > max_price) {
            throw new Error(`Price must be between ${min_price} and ${max_price}`);
          }
        }
      }

      // Prepare update data - use any to bypass strict typing
      const updateData: any = {};
      if (updates.service_name !== undefined) updateData.service_name = updates.service_name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.license_number !== undefined) updateData.license_number = updates.license_number;
      if (updates.license_document_url !== undefined) updateData.license_document_url = updates.license_document_url;
      if (updates.working_hours !== undefined) updateData.working_hours = updates.working_hours;

      // Use raw query to bypass type checking
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .single();

      if (error) throw error;

      // Transform the response data safely
      const updatedService = data as unknown as ProviderServiceData;

      setServices(prev => prev.map(service => service.id === id ? updatedService : service));
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      return updatedService;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      // Use raw query to bypass type checking
      const { error } = await (supabase as any)
        .from('provider_services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServiceStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      // Use raw query to bypass type checking
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .single();

      if (error) throw error;

      // Transform the response data safely
      const updatedService = data as unknown as ProviderServiceData;

      setServices(prev => prev.map(service => service.id === id ? updatedService : service));
      toast({
        title: "Success",
        description: `Service ${status} successfully`,
      });
      return updatedService;
    } catch (error: any) {
      console.error('Error updating service status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleServiceActive = async (id: string, is_active: boolean) => {
    try {
      // Use raw query to bypass type checking
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .update({ is_active })
        .eq('id', id)
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .single();

      if (error) throw error;

      // Transform the response data safely
      const updatedService = data as unknown as ProviderServiceData;

      setServices(prev => prev.map(service => service.id === id ? updatedService : service));
      toast({
        title: "Success",
        description: `Service ${is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling service status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update service status",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchServices();
  }, [providerId]);

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    updateServiceStatus,
    toggleServiceActive,
    refetch: fetchServices
  };
};