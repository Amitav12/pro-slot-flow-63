-- ============================================================================
-- 🔥 4-PERSONA AUTHENTICATION SYSTEM FOR PRO SLOT FLOW
-- ============================================================================
-- Customer | Provider | Admin | Super Admin with granular permissions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Enhanced)
-- ============================================================================
-- Update existing user_profiles table to include role-based authentication
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS auth_role TEXT CHECK (auth_role IN ('customer', 'provider', 'admin', 'super_admin')) DEFAULT 'customer';

-- Update existing profiles to have proper auth roles based on current role
UPDATE public.user_profiles 
SET auth_role = CASE 
  WHEN role = 'provider' THEN 'provider'
  WHEN role = 'admin' THEN 'admin'
  WHEN role = 'super_admin' THEN 'super_admin'
  ELSE 'customer'
END
WHERE auth_role IS NULL;

-- Make auth_role NOT NULL after setting defaults
ALTER TABLE public.user_profiles ALTER COLUMN auth_role SET NOT NULL;

-- ============================================================================
-- 2. ADMIN PERMISSIONS TABLE
-- ============================================================================
-- Controls which dashboard sections Admins can access
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial admin sections (all disabled by default)
INSERT INTO public.admin_permissions (section, display_name, description, sort_order, is_enabled) VALUES
('users', 'User Management', 'Manage customer accounts and profiles', 1, false),
('providers', 'Provider Management', 'Manage service providers and approvals', 2, false),
('services', 'Service Management', 'Approve/reject provider services', 3, false),
('bookings', 'Booking Management', 'View and manage all bookings', 4, false),
('categories', 'Category Management', 'Manage service categories and subcategories', 5, false),
('locations', 'Location Management', 'Manage service locations', 6, false),
('reports', 'Reports & Analytics', 'View system reports and analytics', 7, false),
('payments', 'Payment Management', 'Manage payments and transactions', 8, false),
('notifications', 'Notification Center', 'Send system notifications', 9, false),
('settings', 'System Settings', 'Configure system-wide settings', 10, false)
ON CONFLICT (section) DO NOTHING;

-- ============================================================================
-- 3. ROLE HIERARCHY TABLE
-- ============================================================================
-- Defines role hierarchy and permissions inheritance
CREATE TABLE IF NOT EXISTS public.role_hierarchy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  can_access_role TEXT NOT NULL,
  permission_level TEXT CHECK (permission_level IN ('read', 'write', 'admin')) DEFAULT 'read',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Define role hierarchy
INSERT INTO public.role_hierarchy (role, can_access_role, permission_level) VALUES
-- Super Admin can access everything
('super_admin', 'customer', 'admin'),
('super_admin', 'provider', 'admin'),
('super_admin', 'admin', 'admin'),
('super_admin', 'super_admin', 'admin'),
-- Admin can access based on permissions
('admin', 'customer', 'write'),
('admin', 'provider', 'write'),
-- Provider can only access their own data
('provider', 'provider', 'write'),
('provider', 'customer', 'read'),
-- Customer can only access their own data
('customer', 'customer', 'write')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. AUDIT LOG TABLE
-- ============================================================================
-- Track all admin actions for security
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TRIGGERS FOR AUTO-PROFILE CREATION
-- ============================================================================
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    auth_role,
    role,
    onboarding_completed
  ) VALUES (
    NEW.id, 
    NEW.id, 
    'customer',
    'customer',
    false
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 6. AUDIT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON public.user_profiles;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile (except role changes)
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND auth_role = OLD.auth_role);

-- Super Admin can read all profiles
CREATE POLICY "Super admin can read all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() AND p.auth_role = 'super_admin'
    )
  );

-- Super Admin can update all profiles including roles
CREATE POLICY "Super admin can update all profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() AND p.auth_role = 'super_admin'
    )
  );

-- Admins can read profiles based on permissions
CREATE POLICY "Admin can read profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.auth_role = 'admin'
      AND EXISTS (
        SELECT 1 FROM public.admin_permissions ap 
        WHERE ap.section = 'users' AND ap.is_enabled = true
      )
    )
  );

-- ============================================================================
-- ADMIN PERMISSIONS POLICIES
-- ============================================================================

-- Everyone can read admin permissions (to determine UI visibility)
CREATE POLICY "Anyone can read admin permissions" ON public.admin_permissions
  FOR SELECT USING (true);

-- Only Super Admin can update permissions
CREATE POLICY "Super admin can update permissions" ON public.admin_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() AND p.auth_role = 'super_admin'
    )
  );

-- ============================================================================
-- PROVIDER SERVICES POLICIES
-- ============================================================================

-- Providers can manage their own services
CREATE POLICY "Providers can manage own services" ON public.provider_services
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND auth_role = 'provider'
    )
  );

-- Admins can manage services if they have permission
CREATE POLICY "Admin can manage services" ON public.provider_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.auth_role IN ('admin', 'super_admin')
      AND (
        p.auth_role = 'super_admin' 
        OR EXISTS (
          SELECT 1 FROM public.admin_permissions ap 
          WHERE ap.section = 'services' AND ap.is_enabled = true
        )
      )
    )
  );

-- Customers can read approved services
CREATE POLICY "Customers can read approved services" ON public.provider_services
  FOR SELECT USING (status = 'approved' AND is_active = true);

-- ============================================================================
-- CATEGORIES & SUBCATEGORIES POLICIES
-- ============================================================================

-- Everyone can read active categories and subcategories
CREATE POLICY "Anyone can read active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read active subcategories" ON public.subcategories
  FOR SELECT USING (is_active = true);

-- Admins can manage categories if they have permission
CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.auth_role IN ('admin', 'super_admin')
      AND (
        p.auth_role = 'super_admin' 
        OR EXISTS (
          SELECT 1 FROM public.admin_permissions ap 
          WHERE ap.section = 'categories' AND ap.is_enabled = true
        )
      )
    )
  );

CREATE POLICY "Admin can manage subcategories" ON public.subcategories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.auth_role IN ('admin', 'super_admin')
      AND (
        p.auth_role = 'super_admin' 
        OR EXISTS (
          SELECT 1 FROM public.admin_permissions ap 
          WHERE ap.section = 'categories' AND ap.is_enabled = true
        )
      )
    )
  );

-- ============================================================================
-- BOOKINGS POLICIES
-- ============================================================================

-- Customers can manage their own bookings
CREATE POLICY "Customers can manage own bookings" ON public.bookings
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND auth_role = 'customer'
    )
  );

-- Providers can manage bookings for their services
CREATE POLICY "Providers can manage service bookings" ON public.bookings
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND auth_role = 'provider'
    )
  );

-- Admins can manage all bookings if they have permission
CREATE POLICY "Admin can manage bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.auth_role IN ('admin', 'super_admin')
      AND (
        p.auth_role = 'super_admin' 
        OR EXISTS (
          SELECT 1 FROM public.admin_permissions ap 
          WHERE ap.section = 'bookings' AND ap.is_enabled = true
        )
      )
    )
  );

-- ============================================================================
-- AUDIT LOG POLICIES
-- ============================================================================

-- Only Super Admin can read audit logs
CREATE POLICY "Super admin can read audit logs" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p 
      WHERE p.user_id = auth.uid() AND p.auth_role = 'super_admin'
    )
  );

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has specific admin permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_section TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT auth_role INTO user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check if admin has specific permission
  IF user_role = 'admin' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE section = permission_section AND is_enabled = true
    );
  END IF;
  
  RETURN false;
END;
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT auth_role INTO user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'customer');
END;
$$;

-- Function to promote user role (Super Admin only)
CREATE OR REPLACE FUNCTION public.promote_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is super admin
  SELECT auth_role INTO current_user_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only Super Admin can promote users';
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('customer', 'provider', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update user role
  UPDATE public.user_profiles
  SET auth_role = new_role, role = new_role, updated_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_role ON public.user_profiles(auth_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_section ON public.admin_permissions(section);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_enabled ON public.admin_permissions(is_enabled);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON public.provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_status ON public.provider_services(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- ============================================================================
-- 10. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Enable some admin permissions for testing
UPDATE public.admin_permissions 
SET is_enabled = true 
WHERE section IN ('users', 'providers', 'services');

-- ============================================================================
-- SETUP COMPLETE! 
-- ============================================================================
-- 🎉 Your 4-persona authentication system is now ready!
-- 
-- Roles:
-- - Customer: Can manage own bookings and view services
-- - Provider: Can manage own services and bookings
-- - Admin: Can access sections enabled by Super Admin
-- - Super Admin: Full access + controls Admin permissions
--
-- Next steps:
-- 1. Create frontend components for role-based routing
-- 2. Implement admin permissions management UI
-- 3. Test the complete authentication flow
-- ============================================================================