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
            id,
            name,
            description,
            category:categories(
              id,
              name,
              description
            )
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

  const createService = async (serviceData: any) => {
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

      let licenseDocumentUrl = serviceData.license_document_url;

      // Upload license document if provided
      if (serviceData.licenseFile) {
        const fileExt = serviceData.licenseFile.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const filePath = `licenses/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, serviceData.licenseFile);

        if (uploadError) {
          throw new Error('Failed to upload license document');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        licenseDocumentUrl = publicUrl;
      }

      // Get subcategory details to generate service name and get category_id
      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('subcategories')
        .select(`
          id,
          name,
          category_id,
          min_price,
          max_price,
          category:categories(id, name)
        `)
        .eq('id', serviceData.subcategory_id)
        .single();

      if (subcategoryError) {
        console.error('Error fetching subcategory:', subcategoryError);
        throw new Error('Failed to fetch subcategory details');
      }

      // Note: Skipping provider_categories table insertion as it's not required for service creation

      // Generate service name from subcategory if not provided
      const serviceName = serviceData.service_name || `Professional ${subcategoryData.name}`;

      // Prepare the insert data for provider service request
      const insertData: any = {
        provider_id: profile.id,
        subcategory_id: serviceData.subcategory_id,
        service_name: serviceName,
        description: serviceData.description || `Expert ${subcategoryData.name} services with quality guarantee`,
        price: parseFloat(serviceData.price) || subcategoryData.min_price || 0,
        license_number: serviceData.license_number,
        license_document_url: licenseDocumentUrl,
        status: 'pending',
        is_active: false // Will be activated after admin approval
      };

      // Use upsert to handle duplicate provider-subcategory combinations
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .upsert([insertData], {
          onConflict: 'provider_id,subcategory_id',
          ignoreDuplicates: false
        })
        .select(`
          *,
          subcategory:subcategories(
            id,
            name,
            description,
            category:categories(
              id,
              name,
              description
            )
          ),
          provider:user_profiles!provider_id(
            id,
            full_name,
            business_name
          )
        `)
        .single();

      if (error) throw error;

      // Create admin notification for the category request
      // Note: Temporarily disabled until database function is available
      try {
        // TODO: Re-enable when create_category_request_notification function is deployed
        console.log('Service created successfully - admin notification would be sent here');
        /*
        const { error: notificationError } = await supabase.rpc(
          'create_category_request_notification',
          {
            p_provider_id: profile.id,
            p_provider_name: data.provider?.full_name || data.provider?.business_name || 'Unknown Provider',
            p_category_name: data.subcategory?.category?.name || 'Unknown Category',
            p_license_number: serviceData.license_number,
            p_license_document_url: licenseDocumentUrl
          }
        );
        
        if (notificationError) {
          console.error('Error creating admin notification:', notificationError);
        }
        */
      } catch (notificationError) {
        console.error('Failed to create admin notification:', notificationError);
      }

      // Transform the response data safely
      const newService = data as unknown as ProviderServiceData;

      // Update services list - either add new or update existing
      setServices(prev => {
        const existingIndex = prev.findIndex(s => 
          s.provider_id === newService.provider_id && 
          s.subcategory_id === newService.subcategory_id
        );
        
        if (existingIndex >= 0) {
          // Update existing service
          const updated = [...prev];
          updated[existingIndex] = newService;
          return updated;
        } else {
          // Add new service
          return [newService, ...prev];
        }
      });
      
      toast({
        title: "Success",
        description: "Service request submitted successfully and pending admin approval",
      });
      return newService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit service request",
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
          // Get subcategory details with price limits
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('min_price, max_price')
            .eq('id', service.subcategory_id)
            .single();
            
          if (!subcategoryError && subcategoryData) {
            const { min_price, max_price } = subcategoryData;
            if (updates.price < min_price || updates.price > max_price) {
              throw new Error(`Price must be between ${min_price} and ${max_price}`);
            }
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
            id,
            name,
            description,
            category:categories(
              id,
              name,
              description
            )
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