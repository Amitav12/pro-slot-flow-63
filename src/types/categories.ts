export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    available: boolean;
  };
}

export interface ProviderService {
  id: string;
  provider_id: string;
  subcategory_id: string;
  service_name: string;
  description?: string;
  price: number;
  license_number?: string;
  license_document_url?: string;
  working_hours?: WorkingHours;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  approval_notes?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  subcategory?: Subcategory;
  provider?: {
    id: string;
    full_name: string;
    business_name?: string;
  };
}

export interface CreateCategoryData {
  name: string;
  description: string;
  icon: string;
  is_active?: boolean;
}

export interface CreateSubcategoryData {
  category_id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  is_active?: boolean;
}

export interface CreateProviderServiceData {
  subcategory_id: string;
  service_name: string;
  description?: string;
  price: number;
  license_number?: string;
  license_document_url?: string;
  working_hours?: WorkingHours;
}

export interface ProviderServiceData extends ProviderService {
  category?: Category;
  subcategory: Subcategory;
  provider: {
    id: string;
    full_name: string;
    business_name?: string;
  };
}

export interface Provider {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
  address: string;
}