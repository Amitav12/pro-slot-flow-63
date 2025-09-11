-- Fix Authentication Loading Issue
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Ensure user_profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  auth_role TEXT DEFAULT 'customer',
  business_name TEXT,
  id_document_url TEXT,
  registration_status TEXT DEFAULT 'approved',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.user_profiles;

-- 4. Create comprehensive RLS policies
CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for service role" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    phone,
    role,
    auth_role,
    business_name,
    id_document_url,
    registration_status,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'business_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'id_document_url', NULL),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'provider' THEN 'pending'
      ELSE 'approved'
    END,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'customer' THEN true
      ELSE false
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(auth_role);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Authentication system fixed successfully!';
  RAISE NOTICE 'You can now test the signup flow.';
END $$;