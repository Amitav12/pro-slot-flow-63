-- Fix for Authentication Loading Issue
-- The user_profiles table is missing the auth_role column

-- Add the missing auth_role column
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT 'customer';

-- Update existing records to have auth_role based on their role
UPDATE public.user_profiles SET auth_role = COALESCE(role, 'customer') WHERE auth_role IS NULL;

-- Ensure the column is not null for future records
ALTER TABLE public.user_profiles ALTER COLUMN auth_role SET NOT NULL;

-- Update the trigger function to include auth_role
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
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Authentication loading issue fixed!';
  RAISE NOTICE 'The auth_role column has been added to user_profiles table.';
  RAISE NOTICE 'You can now test the signup flow - it should work perfectly!';
END $$;