-- Complete Database Schema for Pro Slot Flow
-- This schema supports the enhanced service registration system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS provider_services CASCADE;
-- DROP TABLE IF EXISTS subcategories CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS booking_slots CASCADE;
-- DROP TABLE IF EXISTS locations CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS admin_settings CASCADE;

-- Create or update user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin', 'super_admin')),
    phone TEXT,
    address TEXT,
    bio TEXT,
    business_name TEXT,
    contact_person TEXT,
    license_number TEXT,
    registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    license_document_url TEXT,
    id_document_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    emergency_offline BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_price DECIMAL(10,2) DEFAULT 0 NOT NULL,
    max_price DECIMAL(10,2) DEFAULT 999999 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States' NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enhanced provider_services table
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    license_number VARCHAR(255),
    license_document_url TEXT,
    working_hours JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT TRUE,
    approval_notes TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    special_instructions TEXT,
    slot_reserved_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create booking_slots table
CREATE TABLE IF NOT EXISTS booking_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES provider_services(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES user_profiles(id),
    blocked_until TIMESTAMPTZ,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_subcategory_id ON provider_services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_status ON provider_services(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_provider_id ON booking_slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_date ON booking_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
    BEFORE UPDATE ON subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_services_updated_at ON provider_services;
CREATE TRIGGER update_provider_services_updated_at
    BEFORE UPDATE ON provider_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Categories and subcategories policies (public read)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Anyone can view subcategories" ON subcategories;
CREATE POLICY "Anyone can view subcategories" ON subcategories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage subcategories" ON subcategories;
CREATE POLICY "Admins can manage subcategories" ON subcategories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Locations policies
DROP POLICY IF EXISTS "Anyone can view locations" ON locations;
CREATE POLICY "Anyone can view locations" ON locations
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
CREATE POLICY "Admins can manage locations" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Provider services policies
DROP POLICY IF EXISTS "Public can view approved services" ON provider_services;
CREATE POLICY "Public can view approved services" ON provider_services
    FOR SELECT USING (status = 'approved' AND is_active = true);

DROP POLICY IF EXISTS "Providers can manage their own services" ON provider_services;
CREATE POLICY "Providers can manage their own services" ON provider_services
    FOR ALL USING (
        provider_id IN (
            SELECT id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all services" ON provider_services;
CREATE POLICY "Admins can manage all services" ON provider_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (
        customer_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
        provider_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (
        customer_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()) OR
        provider_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- Favorites policies
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (
        user_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    );

-- Admin settings policies
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings" ON admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Storage policies for documents
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
CREATE POLICY "Users can upload their own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Insert sample data (optional)
INSERT INTO categories (name, description, icon) VALUES
    ('Home Services', 'Professional home maintenance and repair services', 'home'),
    ('Health & Wellness', 'Health, fitness, and wellness services', 'heart'),
    ('Beauty & Personal Care', 'Beauty treatments and personal care services', 'sparkles'),
    ('Education & Training', 'Educational and training services', 'book'),
    ('Technology', 'IT and technology services', 'laptop')
ON CONFLICT DO NOTHING;

-- Insert sample subcategories
INSERT INTO subcategories (category_id, name, description, min_price, max_price) 
SELECT 
    c.id,
    subcategory_data.name,
    subcategory_data.description,
    subcategory_data.min_price,
    subcategory_data.max_price
FROM categories c
CROSS JOIN (
    VALUES 
        ('Home Services', 'House Cleaning', 'Professional house cleaning services', 50, 300),
        ('Home Services', 'Plumbing', 'Plumbing repair and installation', 75, 500),
        ('Home Services', 'Electrical Work', 'Electrical repairs and installations', 100, 800),
        ('Health & Wellness', 'Personal Training', 'One-on-one fitness training', 40, 150),
        ('Health & Wellness', 'Massage Therapy', 'Therapeutic massage services', 60, 200),
        ('Beauty & Personal Care', 'Hair Styling', 'Professional hair styling services', 30, 200),
        ('Beauty & Personal Care', 'Nail Care', 'Manicure and pedicure services', 25, 100),
        ('Education & Training', 'Tutoring', 'Academic tutoring services', 25, 100),
        ('Technology', 'Computer Repair', 'Computer and laptop repair services', 50, 300)
) AS subcategory_data(category_name, name, description, min_price, max_price)
WHERE c.name = subcategory_data.category_name
ON CONFLICT DO NOTHING;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id, 
        full_name, 
        role,
        phone,
        onboarding_completed
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
        NEW.raw_user_meta_data ->> 'phone',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;