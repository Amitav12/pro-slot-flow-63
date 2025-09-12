export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_enabled: boolean
          section: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_enabled?: boolean
          section: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          section?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      booking_slots: {
        Row: {
          blocked_by: string | null
          blocked_until: string | null
          booking_id: string | null
          created_at: string | null
          held_by: string | null
          hold_expires_at: string | null
          id: string
          is_blocked: boolean | null
          provider_id: string
          service_id: string | null
          slot_date: string
          slot_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          blocked_by?: string | null
          blocked_until?: string | null
          booking_id?: string | null
          created_at?: string | null
          held_by?: string | null
          hold_expires_at?: string | null
          id?: string
          is_blocked?: boolean | null
          provider_id: string
          service_id?: string | null
          slot_date: string
          slot_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          blocked_by?: string | null
          blocked_until?: string | null
          booking_id?: string | null
          created_at?: string | null
          held_by?: string | null
          hold_expires_at?: string | null
          id?: string
          is_blocked?: boolean | null
          provider_id?: string
          service_id?: string | null
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          price: number
          provider_id: string | null
          provider_name: string | null
          quantity: number
          service_details: Json | null
          service_id: string
          service_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          provider_id?: string | null
          provider_name?: string | null
          quantity?: number
          service_details?: Json | null
          service_id: string
          service_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          provider_id?: string | null
          provider_name?: string | null
          quantity?: number
          service_details?: Json | null
          service_id?: string
          service_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_favorites: {
        Row: {
          category: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          location: string | null
          price_range: string | null
          provider_name: string
          rating: number | null
          service_id: string
          service_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          location?: string | null
          price_range?: string | null
          provider_name: string
          rating?: number | null
          service_id: string
          service_name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          location?: string | null
          price_range?: string | null
          provider_name?: string
          rating?: number | null
          service_id?: string
          service_name?: string
        }
        Relationships: []
      }
      guest_cart_items: {
        Row: {
          created_at: string
          id: string
          price: number
          provider_id: string | null
          provider_name: string | null
          quantity: number
          service_details: Json | null
          service_id: string
          service_name: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          provider_id?: string | null
          provider_name?: string | null
          quantity?: number
          service_details?: Json | null
          service_id: string
          service_name: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          provider_id?: string | null
          provider_name?: string | null
          quantity?: number
          service_details?: Json | null
          service_id?: string
          service_name?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          booking_date: string
          booking_status: string | null
          booking_time: string
          cart_items: Json | null
          created_at: string | null
          currency: string | null
          customer_address: string | null
          customer_info: Json | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          provider_id: string | null
          provider_name: string
          service_id: string | null
          service_name: string
          special_instructions: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date: string
          booking_status?: string | null
          booking_time: string
          cart_items?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_info?: Json | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          provider_name: string
          service_id?: string | null
          service_name: string
          special_instructions?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_status?: string | null
          booking_time?: string
          cart_items?: Json | null
          created_at?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_info?: Json | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          provider_name?: string
          service_id?: string | null
          service_name?: string
          special_instructions?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          cart_items: Json | null
          client_secret: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          status: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cart_items?: Json | null
          client_secret?: string | null
          created_at?: string
          currency?: string
          id: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cart_items?: Json | null
          client_secret?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          provider_id: string
          slot_duration: number
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          provider_id: string
          slot_duration?: number
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          provider_id?: string
          slot_duration?: number
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          gallery_images: Json | null
          gallery_images_urls: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          license_document_url: string | null
          license_number: string | null
          price: number
          provider_id: string
          rating: number | null
          service_name: string
          status: string | null
          subcategory_id: string
          total_bookings: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          gallery_images?: Json | null
          gallery_images_urls?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          price: number
          provider_id: string
          rating?: number | null
          service_name: string
          status?: string | null
          subcategory_id: string
          total_bookings?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          gallery_images?: Json | null
          gallery_images_urls?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          price?: number
          provider_id?: string
          rating?: number | null
          service_name?: string
          status?: string | null
          subcategory_id?: string
          total_bookings?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          risk_level: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_provider_documents: {
        Row: {
          document_name: string
          document_type: string
          document_url: string
          id: string
          provider_id: string | null
          uploaded_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          document_url: string
          id?: string
          provider_id?: string | null
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          provider_id?: string | null
          uploaded_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          address: string
          business_name: string
          certifications: Json | null
          contact_person: string
          created_at: string
          email: string
          id: string
          id_document_url: string | null
          is_emergency_offline: boolean | null
          is_featured: boolean | null
          license_document_url: string | null
          license_number: string | null
          phone: string
          profile_image_url: string | null
          rating: number | null
          response_time_minutes: number | null
          specializations: Json | null
          status: string | null
          total_completed_jobs: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          years_of_experience: number | null
        }
        Insert: {
          address: string
          business_name: string
          certifications?: Json | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          id_document_url?: string | null
          is_emergency_offline?: boolean | null
          is_featured?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          phone: string
          profile_image_url?: string | null
          rating?: number | null
          response_time_minutes?: number | null
          specializations?: Json | null
          status?: string | null
          total_completed_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_of_experience?: number | null
        }
        Update: {
          address?: string
          business_name?: string
          certifications?: Json | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          id_document_url?: string | null
          is_emergency_offline?: boolean | null
          is_featured?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          phone?: string
          profile_image_url?: string | null
          rating?: number | null
          response_time_minutes?: number | null
          specializations?: Json | null
          status?: string | null
          total_completed_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_price: number
          min_price: number
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_price?: number
          min_price?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_price?: number
          min_price?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          display_order: number
          end_time: string
          id: string
          is_active: boolean | null
          slot_name: string
          start_time: string
        }
        Insert: {
          created_at?: string
          display_order: number
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_name: string
          start_time: string
        }
        Update: {
          created_at?: string
          display_order?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_name?: string
          start_time?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          auth_role: string | null
          business_name: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_offline: boolean | null
          full_name: string | null
          home_address: string | null
          id: string
          id_document_url: string | null
          is_blocked: boolean | null
          license_document_url: string | null
          license_number: string | null
          nearby_address: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          registration_status: string | null
          role: string | null
          state: string | null
          street_address: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          auth_role?: string | null
          business_name?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_offline?: boolean | null
          full_name?: string | null
          home_address?: string | null
          id?: string
          id_document_url?: string | null
          is_blocked?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          nearby_address?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          registration_status?: string | null
          role?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          auth_role?: string | null
          business_name?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_offline?: boolean | null
          full_name?: string | null
          home_address?: string | null
          id?: string
          id_document_url?: string | null
          is_blocked?: boolean | null
          license_document_url?: string | null
          license_number?: string | null
          nearby_address?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          registration_status?: string | null
          role?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_provider: {
        Args: { provider_user_id: string }
        Returns: Json
      }
      check_duplicate_credentials: {
        Args: {
          check_email: string
          check_full_name?: string
          check_phone?: string
        }
        Returns: {
          existing_role: string
          exists_email: boolean
          exists_name: boolean
          exists_phone: boolean
        }[]
      }
      confirm_slot_booking: {
        Args: { booking_id: string; slot_id: string; user_id: string }
        Returns: boolean
      }
      get_available_slots: {
        Args: { p_date: string; p_provider_id: string; p_service_id: string }
        Returns: {
          blocked_by: string
          blocked_until: string
          booking_id: string
          created_at: string
          held_by: string
          hold_expires_at: string
          id: string
          is_blocked: boolean
          provider_id: string
          service_id: string
          slot_date: string
          slot_time: string
          status: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: string
      }
      hold_slot: {
        Args: {
          hold_duration_minutes?: number
          slot_id: string
          user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_risk_level?: string
        }
        Returns: undefined
      }
      promote_user_role: {
        Args: { new_role: string; user_uuid: string }
        Returns: Json
      }
      reject_provider: {
        Args: { provider_user_id: string }
        Returns: Json
      }
      release_slot: {
        Args: { slot_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
