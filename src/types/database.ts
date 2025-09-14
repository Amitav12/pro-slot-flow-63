// Database types based on actual Supabase structure
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      provider_notification_preferences: {
        Row: {
          id: string;
          provider_id: string;
          availability_reminder_enabled: boolean;
          reminder_days_advance: number;
          notification_time: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          availability_reminder_enabled?: boolean;
          reminder_days_advance?: number;
          notification_time?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          availability_reminder_enabled?: boolean;
          reminder_days_advance?: number;
          notification_time?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          min_price: number;
          max_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description: string;
          min_price: number;
          max_price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          min_price?: number;
          max_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          latitude: number;
          longitude: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
          working_hours: any | null;
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
          working_hours?: any | null;
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
          working_hours?: any | null;
          status?: 'pending' | 'approved' | 'rejected';
          is_active?: boolean;
          approval_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          provider_id: string | null;
          service_id: string | null;
          booking_date: string;
          booking_time: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          total_amount: number;
          payment_status: 'pending' | 'paid' | 'refunded';
          payment_intent_id: string | null;
          special_instructions: string | null;
          slot_reserved_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          provider_id?: string | null;
          service_id?: string | null;
          booking_date: string;
          booking_time: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          payment_intent_id?: string | null;
          special_instructions?: string | null;
          slot_reserved_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          provider_id?: string | null;
          service_id?: string | null;
          booking_date?: string;
          booking_time?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          total_amount?: number;
          payment_status?: 'pending' | 'paid' | 'refunded';
          payment_intent_id?: string | null;
          special_instructions?: string | null;
          slot_reserved_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_slots: {
        Row: {
          id: string;
          provider_id: string | null;
          service_id: string | null;
          slot_date: string;
          slot_time: string;
          status: 'available' | 'held' | 'booked';
          is_blocked: boolean;
          blocked_by: string | null;
          blocked_until: string | null;
          held_by: string | null;
          hold_expires_at: string | null;
          booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id?: string | null;
          service_id?: string | null;
          slot_date: string;
          slot_time: string;
          status?: 'available' | 'held' | 'booked';
          is_blocked?: boolean;
          blocked_by?: string | null;
          blocked_until?: string | null;
          held_by?: string | null;
          hold_expires_at?: string | null;
          booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string | null;
          service_id?: string | null;
          slot_date?: string;
          slot_time?: string;
          status?: 'available' | 'held' | 'booked';
          is_blocked?: boolean;
          blocked_by?: string | null;
          blocked_until?: string | null;
          held_by?: string | null;
          hold_expires_at?: string | null;
          booking_id?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          is_read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string | null;
          provider_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          provider_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          provider_id?: string | null;
          created_at?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          file_size: number | null;
          duration: number | null;
          mime_type: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: number | null;
          mime_type?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: number | null;
          mime_type?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_notification_preferences: {
        Row: {
          id: string;
          provider_id: string;
          availability_reminder_enabled: boolean;
          reminder_days_advance: number;
          notification_time: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          availability_reminder_enabled?: boolean;
          reminder_days_advance?: number;
          notification_time?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          availability_reminder_enabled?: boolean;
          reminder_days_advance?: number;
          notification_time?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Subcategory = Database['public']['Tables']['subcategories']['Row'];
export type SubcategoryInsert = Database['public']['Tables']['subcategories']['Insert'];
export type SubcategoryUpdate = Database['public']['Tables']['subcategories']['Update'];

export type Location = Database['public']['Tables']['locations']['Row'];
export type LocationInsert = Database['public']['Tables']['locations']['Insert'];
export type LocationUpdate = Database['public']['Tables']['locations']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type ProviderService = Database['public']['Tables']['provider_services']['Row'];
export type ProviderServiceInsert = Database['public']['Tables']['provider_services']['Insert'];
export type ProviderServiceUpdate = Database['public']['Tables']['provider_services']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type BookingSlot = Database['public']['Tables']['booking_slots']['Row'];
export type BookingSlotInsert = Database['public']['Tables']['booking_slots']['Insert'];
export type BookingSlotUpdate = Database['public']['Tables']['booking_slots']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert'];
export type FavoriteUpdate = Database['public']['Tables']['favorites']['Update'];

export type AdminSetting = Database['public']['Tables']['admin_settings']['Row'];
export type AdminSettingInsert = Database['public']['Tables']['admin_settings']['Insert'];
export type AdminSettingUpdate = Database['public']['Tables']['admin_settings']['Update'];

export type GalleryVideo = Database['public']['Tables']['gallery_videos']['Row'];
export type GalleryVideoInsert = Database['public']['Tables']['gallery_videos']['Insert'];
export type GalleryVideoUpdate = Database['public']['Tables']['gallery_videos']['Update'];

export type ProviderNotificationPreferences = Database['public']['Tables']['provider_notification_preferences']['Row'];
export type ProviderNotificationPreferencesInsert = Database['public']['Tables']['provider_notification_preferences']['Insert'];
export type ProviderNotificationPreferencesUpdate = Database['public']['Tables']['provider_notification_preferences']['Update'];

// Extended types with relationships
export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export interface ProviderServiceWithDetails extends ProviderService {
  subcategory: SubcategoryWithCategory;
  provider: UserProfile;
}