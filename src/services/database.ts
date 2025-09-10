// Comprehensive database service for Supabase operations
import { supabase } from '@/integrations/supabase/client';
import type { 
  Category, 
  Subcategory, 
  ProviderService,
  CreateCategoryData,
  CreateSubcategoryData,
  CreateProviderServiceData
} from '@/types/categories';
import type { 
  Location, 
  UserProfile
} from '@/types/database';

// Additional types for locations
export interface CreateLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

// Categories Service
export const categoriesService = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Categories fetch error:', error);
      throw error;
    }
    return data || [];
  },

  // Get category by ID
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('id' as any, id as any)
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Create new category
  async create(categoryData: CreateCategoryData): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData as any])
      .select()
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Update category
  async update(id: string, updates: Partial<CreateCategoryData>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Delete category
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle active status
  async toggleStatus(id: string, is_active: boolean): Promise<any> {
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Subcategories Service
export const subcategoriesService = {
  // Get all subcategories with category info
  async getAll(categoryId?: string): Promise<Subcategory[]> {
    let query = supabase
      .from('subcategories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Subcategories fetch error:', error);
      throw error;
    }
    return data || [];
  },

  // Get subcategory by ID
  async getById(id: string): Promise<Subcategory | null> {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new subcategory
  async create(subcategoryData: CreateSubcategoryData): Promise<Subcategory> {
    const { data, error } = await supabase
      .from('subcategories')
      .insert([subcategoryData])
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update subcategory
  async update(id: string, updates: Partial<CreateSubcategoryData>): Promise<Subcategory> {
    const { data, error } = await supabase
      .from('subcategories')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete subcategory
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle active status
  async toggleStatus(id: string, is_active: boolean): Promise<Subcategory> {
    const { data, error } = await supabase
      .from('subcategories')
      .update({ is_active })
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Locations Service
export const locationsService = {
  // Get all locations
  async getAll(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Get location by ID
  async getById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new location
  async create(locationData: CreateLocationData): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update location
  async update(id: string, updates: Partial<CreateLocationData>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete location
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle active status
  async toggleStatus(id: string, is_active: boolean): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// User Profiles Service
export const userProfilesService = {
  // Get all user profiles
  async getAll(role?: string): Promise<UserProfile[]> {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return (data as any) || [];
  },

  // Get user profile by user_id
  async getByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return (data as any);
  },

  // Create user profile
  async create(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Update user profile
  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return (data as any);
  }
};

// Provider Services Service
export const providerServicesService = {
  // Get all provider services
  async getAll(providerId?: string): Promise<ProviderService[]> {
    let query = supabase
      .from('provider_services')
      .select(`
        *,
        provider:user_profiles(*),
        subcategory:subcategories(
          *,
          category:categories(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return (data as any) || [];
  },

  // Create provider service
  async create(serviceData: CreateProviderServiceData): Promise<ProviderService> {
    const { data, error } = await (supabase as any)
      .from('provider_services')
      .insert([serviceData as any])
      .select(`
        *,
        provider:user_profiles(*),
        subcategory:subcategories(
          *,
          category:categories(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Update provider service
  async update(id: string, updates: Partial<CreateProviderServiceData>): Promise<ProviderService> {
    const { data, error } = await supabase
      .from('provider_services')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        provider:user_profiles(*),
        subcategory:subcategories(
          *,
          category:categories(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return (data as any);
  },

  // Update service status (for admin approval)
  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<ProviderService> {
    const { data, error } = await supabase
      .from('provider_services')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        provider:user_profiles(*),
        subcategory:subcategories(
          *,
          category:categories(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return (data as any);
  }
};

// Database health check
export const databaseService = {
  async healthCheck(): Promise<{ connected: boolean; tablesAccessible: string[]; errors: string[] }> {
    const tables = ['categories', 'subcategories', 'locations', 'user_profiles', 'provider_services'];
    const accessible: string[] = [];
    const errors: string[] = [];
    
    for (const table of tables) {
      try {
        const { error } = await (supabase as any)
          .from(table as any)
          .select('*')
          .limit(1);
          
        if (error) {
          errors.push(`${table}: ${error.message}`);
        } else {
          accessible.push(table);
        }
      } catch (err: any) {
        errors.push(`${table}: ${err.message}`);
      }
    }
    
    return {
      connected: accessible.length > 0,
      tablesAccessible: accessible,
      errors
    };
  }
};