-- =====================================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- =====================================================

-- First, ensure user_profiles table exists (if not already created)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin', 'super_admin')),
  phone VARCHAR(20),
  address TEXT,
  business_name VARCHAR(255),
  contact_person VARCHAR(255),
  license_number VARCHAR(255),
  registration_status VARCHAR(50) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
  license_document_url TEXT,
  id_document_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  emergency_offline BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_price DECIMAL(10,2) NOT NULL DEFAULT 999999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider_services table for service provider registrations
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  license_number VARCHAR(255),
  license_document_url TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, subcategory_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_subcategory_id ON provider_services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_status ON provider_services(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_services_updated_at BEFORE UPDATE ON provider_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- User profiles policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Categories policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Subcategories policies
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone" ON subcategories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert subcategories" ON subcategories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can update subcategories" ON subcategories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete subcategories" ON subcategories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Locations policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage locations" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Provider services policies
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider services are viewable by admins and owners" ON provider_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND (role IN ('admin', 'super_admin') OR id = provider_services.provider_id)
        )
    );

CREATE POLICY "Only providers can insert their services" ON provider_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'provider'
            AND id = provider_id
        )
    );

CREATE POLICY "Providers can update their own services, admins can update any" ON provider_services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND (
                role IN ('admin', 'super_admin') 
                OR (role = 'provider' AND id = provider_services.provider_id)
            )
        )
    );

CREATE POLICY "Providers can delete their own services, admins can delete any" ON provider_services
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND (
                role IN ('admin', 'super_admin') 
                OR (role = 'provider' AND id = provider_services.provider_id)
            )
        )
    );

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description, icon) VALUES
('Home Services', 'Professional home maintenance and repair services', 'home'),
('Health & Wellness', 'Healthcare and wellness services', 'heart'),
('Beauty & Personal Care', 'Beauty treatments and personal care services', 'sparkles'),
('Automotive', 'Vehicle maintenance and repair services', 'car'),
('Technology', 'IT support and technology services', 'laptop')
ON CONFLICT DO NOTHING;

-- Insert sample subcategories for Home Services
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
        ('Plumbing', 'Professional plumbing services', 50.00, 500.00),
        ('Electrical', 'Electrical installation and repair', 75.00, 800.00),
        ('Cleaning', 'House cleaning services', 30.00, 200.00),
        ('HVAC', 'Heating, ventilation, and air conditioning', 100.00, 1000.00)
) AS subcategory_data(name, description, min_price, max_price)
WHERE c.name = 'Home Services'
ON CONFLICT DO NOTHING;

-- Insert sample subcategories for Health & Wellness
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
        ('General Consultation', 'General medical consultation', 25.00, 150.00),
        ('Physiotherapy', 'Physical therapy services', 40.00, 200.00),
        ('Mental Health', 'Counseling and therapy services', 50.00, 300.00),
        ('Nutrition', 'Dietary consultation and planning', 30.00, 120.00)
) AS subcategory_data(name, description, min_price, max_price)
WHERE c.name = 'Health & Wellness'
ON CONFLICT DO NOTHING;

-- Insert sample subcategories for Automotive
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
        ('Car Wash', 'Professional car washing services', 15.00, 50.00),
        ('Repair & Maintenance', 'Vehicle repair and maintenance', 50.00, 1000.00),
        ('Oil Change', 'Engine oil change service', 25.00, 80.00),
        ('Tire Service', 'Tire installation and repair', 30.00, 200.00)
) AS subcategory_data(name, description, min_price, max_price)
WHERE c.name = 'Automotive'
ON CONFLICT DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, address, city, state, postal_code, country, latitude, longitude) VALUES
('Downtown Service Center', '123 Main St', 'New York', 'NY', '10001', 'United States', 40.7128, -74.0060),
('Westside Branch', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'United States', 34.0522, -118.2437),
('North Plaza', '789 Pine Rd', 'Chicago', 'IL', '60601', 'United States', 41.8781, -87.6298),
('South Bay Center', '321 Elm St', 'Miami', 'FL', '33101', 'United States', 25.7617, -80.1918)
ON CONFLICT DO NOTHING;

-- Create a demo admin user profile (for development)
-- Note: This will only work if the auth user exists
INSERT INTO user_profiles (user_id, full_name, role, is_blocked, onboarding_completed)
SELECT 
    auth.uid(),
    'Development Admin',
    'admin',
    false,
    true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    is_blocked = false,
    onboarding_completed = true;