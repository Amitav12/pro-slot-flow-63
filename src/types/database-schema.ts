// Generated schema types from Supabase
// Generated on: 2025-09-03T06:40:26.269Z
import { WorkingHours } from './categories';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string | null;
          name: string | null;
          description: string | null;
          icon: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          icon?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          icon?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      admin_notifications: {
        Row: {
          id: string;
          type: 'service_request' | 'provider_registration' | 'booking_issue' | 'system_alert';
          title: string;
          message: string;
          data: Record<string, unknown> | null;
          is_read: boolean;
          created_by: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'service_request' | 'provider_registration' | 'booking_issue' | 'system_alert';
          title: string;
          message: string;
          data?: Record<string, unknown> | null;
          is_read?: boolean;
          created_by?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'service_request' | 'provider_registration' | 'booking_issue' | 'system_alert';
          title?: string;
          message?: string;
          data?: Record<string, unknown> | null;
          is_read?: boolean;
          created_by?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
      };
      subcategories: {
        Row: {
          id: string | null;
          category_id: string | null;
          name: string | null;
          description: string | null;
          min_price: string | null;
          max_price: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          category_id?: string | null;
          name?: string | null;
          description?: string | null;
          min_price?: string | null;
          max_price?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          category_id?: string | null;
          name?: string | null;
          description?: string | null;
          min_price?: string | null;
          max_price?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      locations: {
        Row: {
          id: string | null;
          name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: string | null;
          longitude: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: string | null;
          longitude?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: string | null;
          longitude?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          role: 'customer' | 'provider' | 'admin' | 'super_admin';
          auth_role: 'customer' | 'provider' | 'admin' | 'super_admin';
          phone: string | null;
          address: string | null;
          business_name: string | null;
          contact_person: string | null;
          license_number: string | null;
          registration_status: 'pending' | 'approved' | 'rejected';
          license_document_url: string | null;
          id_document_url: string | null;
          onboarding_completed: boolean;
          emergency_offline: boolean;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
          city: string | null;
          date_of_birth: string | null;
          preferences: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          role?: 'customer' | 'provider' | 'admin' | 'super_admin';
          auth_role?: 'customer' | 'provider' | 'admin' | 'super_admin';
          phone?: string | null;
          address?: string | null;
          business_name?: string | null;
          contact_person?: string | null;
          license_number?: string | null;
          registration_status?: 'pending' | 'approved' | 'rejected';
          license_document_url?: string | null;
          id_document_url?: string | null;
          onboarding_completed?: boolean;
          emergency_offline?: boolean;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
          city?: string | null;
          date_of_birth?: string | null;
          preferences?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          role?: 'customer' | 'provider' | 'admin' | 'super_admin';
          auth_role?: 'customer' | 'provider' | 'admin' | 'super_admin';
          phone?: string | null;
          address?: string | null;
          business_name?: string | null;
          contact_person?: string | null;
          license_number?: string | null;
          registration_status?: 'pending' | 'approved' | 'rejected';
          license_document_url?: string | null;
          id_document_url?: string | null;
          onboarding_completed?: boolean;
          emergency_offline?: boolean;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
          city?: string | null;
          date_of_birth?: string | null;
          preferences?: Record<string, unknown>;
        };
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          subcategory_id: string;
          service_name: string;
          description: string | null;
          price: number;
          license_number: string | null;
          license_document_url: string | null;
          working_hours: WorkingHours | null;
          status: 'pending' | 'approved' | 'rejected';
          is_active: boolean;
          approval_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          subcategory_id: string;
          service_name: string;
          description?: string | null;
          price: number;
          license_number?: string | null;
          license_document_url?: string | null;
          working_hours?: WorkingHours | null;
          status?: 'pending' | 'approved' | 'rejected';
          is_active?: boolean;
          approval_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          subcategory_id?: string;
          service_name?: string;
          description?: string | null;
          price?: number;
          license_number?: string | null;
          license_document_url?: string | null;
          working_hours?: WorkingHours | null;
          status?: 'pending' | 'approved' | 'rejected';
          is_active?: boolean;
          approval_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_favorites: {
        Row: {
          id: string | null;
          customer_id: string | null;
          service_id: string | null;
          service_name: string | null;
          provider_name: string | null;
          category: string | null;
          rating: number | null;
          price_range: string | null;
          location: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          customer_id?: string | null;
          service_id?: string | null;
          service_name?: string | null;
          provider_name?: string | null;
          category?: string | null;
          rating?: number | null;
          price_range?: string | null;
          location?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          customer_id?: string | null;
          service_id?: string | null;
          service_name?: string | null;
          provider_name?: string | null;
          category?: string | null;
          rating?: number | null;
          price_range?: string | null;
          location?: string | null;
          created_at?: string | null;
        };
      };
      admin_settings: {
        Row: any;
        Insert: any;
        Update: any;
      };
      bookings: {
        Row: any;
        Insert: any;
        Update: any;
      };
      booking_slots: {
        Row: any;
        Insert: any;
        Update: any;
      };
      favorites: {
        Row: any;
        Insert: any;
        Update: any;
      };
      notifications: {
        Row: any;
        Insert: any;
        Update: any;
      };
      services: {
        Row: any;
        Insert: any;
        Update: any;
      };
      service_providers: {
        Row: any;
        Insert: any;
        Update: any;
      };
      service_provider_documents: {
        Row: any;
        Insert: any;
        Update: any;
      };
      security_audit_log: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_duplicate_credentials: {
        Args: {
          check_email: string;
          check_phone?: string;
          check_full_name?: string;
        };
        Returns: {
          exists_email: boolean;
          exists_phone: boolean;
          exists_name: boolean;
          existing_role: string;
        }[];
      };
      promote_user_role: {
        Args: {
          user_uuid: string;
          new_role: string;
        };
        Returns: any;
      };
      log_security_event: {
        Args: {
          p_event_type: string;
          p_event_data?: any;
          p_risk_level?: string;
        };
        Returns: void;
      };
      get_user_role: {
        Args: {
          user_uuid?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}