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
      booking_discounts: {
        Row: {
          booking_id: string
          coupon_code: string | null
          created_at: string
          discount_amount: number
          discount_type: string
          discount_value: number
          id: string
          offer_id: string | null
        }
        Insert: {
          booking_id: string
          coupon_code?: string | null
          created_at?: string
          discount_amount: number
          discount_type: string
          discount_value: number
          id?: string
          offer_id?: string | null
        }
        Update: {
          booking_id?: string
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          id?: string
          offer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_discounts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_discounts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "special_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_fees: {
        Row: {
          booking_id: string
          created_at: string
          description: string | null
          fee_amount: number
          fee_type: string
          fee_value: number
          id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          description?: string | null
          fee_amount: number
          fee_type: string
          fee_value: number
          id?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          description?: string | null
          fee_amount?: number
          fee_type?: string
          fee_value?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_fees_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          customer_id: string | null
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          provider_id: string | null
          service_id: string | null
          special_instructions: string | null
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          customer_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          service_id?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          service_id?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
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
      coupons: {
        Row: {
          booking_id: string | null
          code_used: string
          customer_id: string | null
          discount_applied: number
          final_amount: number
          id: string
          offer_id: string
          original_amount: number
          status: string | null
          used_at: string
        }
        Insert: {
          booking_id?: string | null
          code_used: string
          customer_id?: string | null
          discount_applied: number
          final_amount: number
          id?: string
          offer_id: string
          original_amount: number
          status?: string | null
          used_at?: string
        }
        Update: {
          booking_id?: string | null
          code_used?: string
          customer_id?: string | null
          discount_applied?: number
          final_amount?: number
          id?: string
          offer_id?: string
          original_amount?: number
          status?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "special_offers"
            referencedColumns: ["id"]
          },
        ]
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
      gallery_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
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
      platform_fees: {
        Row: {
          applicable_categories: Json | null
          applicable_services: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          fee_type: string
          fee_value: number
          id: string
          is_active: boolean | null
          maximum_fee: number | null
          minimum_fee: number | null
          updated_at: string
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_services?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fee_type: string
          fee_value: number
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          updated_at?: string
        }
        Update: {
          applicable_categories?: Json | null
          applicable_services?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fee_type?: string
          fee_value?: number
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          updated_at?: string
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
      provider_availability_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          notification_type: string
          provider_id: string
          sent_at: string
          status: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          notification_type?: string
          provider_id: string
          sent_at?: string
          status?: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          notification_type?: string
          provider_id?: string
          sent_at?: string
          status?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_notifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_notification_preferences: {
        Row: {
          availability_reminder_enabled: boolean
          created_at: string
          id: string
          notification_methods: Json
          provider_id: string
          reminder_days_advance: number
          updated_at: string
          week_start_day: number
        }
        Insert: {
          availability_reminder_enabled?: boolean
          created_at?: string
          id?: string
          notification_methods?: Json
          provider_id: string
          reminder_days_advance?: number
          updated_at?: string
          week_start_day?: number
        }
        Update: {
          availability_reminder_enabled?: boolean
          created_at?: string
          id?: string
          notification_methods?: Json
          provider_id?: string
          reminder_days_advance?: number
          updated_at?: string
          week_start_day?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_notification_preferences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      provider_weekly_availability: {
        Row: {
          availability_data: Json
          created_at: string
          id: string
          is_confirmed: boolean
          provider_id: string
          updated_at: string
          week_end: string
          week_start: string
        }
        Insert: {
          availability_data?: Json
          created_at?: string
          id?: string
          is_confirmed?: boolean
          provider_id: string
          updated_at?: string
          week_end: string
          week_start: string
        }
        Update: {
          availability_data?: Json
          created_at?: string
          id?: string
          is_confirmed?: boolean
          provider_id?: string
          updated_at?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_weekly_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      special_offers: {
        Row: {
          applicable_categories: Json | null
          applicable_services: Json | null
          code: string
          created_at: string
          created_by: string | null
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          title: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_services?: Json | null
          code: string
          created_at?: string
          created_by?: string | null
          description: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          title: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          applicable_categories?: Json | null
          applicable_services?: Json | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          valid_from?: string
          valid_until?: string
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
      tax_slabs: {
        Row: {
          applies_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          maximum_amount: number | null
          minimum_amount: number | null
          name: string
          tax_percentage: number
          updated_at: string
        }
        Insert: {
          applies_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          name: string
          tax_percentage: number
          updated_at?: string
        }
        Update: {
          applies_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          name?: string
          tax_percentage?: number
          updated_at?: string
        }
        Relationships: []
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
          working_hours: Json | null
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
          working_hours?: Json | null
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
          working_hours?: Json | null
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
      calculate_platform_fees: {
        Args: { order_amount: number; service_ids?: string[] }
        Returns: number
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
      generate_provider_slots: {
        Args: {
          p_end_date: string
          p_provider_id: string
          p_start_date: string
        }
        Returns: undefined
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
      get_providers_needing_availability_reminder: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          phone: string
          provider_id: string
          provider_name: string
          reminder_days_advance: number
          week_start: string
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
      validate_coupon_code: {
        Args: { coupon_code: string; customer_id: string; order_amount: number }
        Returns: {
          discount_amount: number
          error_message: string
          is_valid: boolean
          offer_id: string
        }[]
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
