-- Add function to check for duplicate user credentials
-- Run this in Supabase Dashboard → SQL Editor

-- Function to check if user credentials already exist
CREATE OR REPLACE FUNCTION check_duplicate_credentials(
  check_email TEXT,
  check_phone TEXT DEFAULT NULL,
  check_full_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  exists_email BOOLEAN,
  exists_phone BOOLEAN,
  exists_name BOOLEAN,
  existing_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_exists BOOLEAN := FALSE;
  phone_exists BOOLEAN := FALSE;
  name_exists BOOLEAN := FALSE;
  found_role TEXT := NULL;
BEGIN
  -- Check if email exists in auth.users (this requires RLS bypass)
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = check_email
  ) INTO email_exists;
  
  -- Check if phone exists in user_profiles
  IF check_phone IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles WHERE phone = check_phone
    ) INTO phone_exists;
    
    -- Get the role of user with this phone
    SELECT role INTO found_role 
    FROM public.user_profiles 
    WHERE phone = check_phone 
    LIMIT 1;
  END IF;
  
  -- Check if full name exists in user_profiles
  IF check_full_name IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles WHERE full_name = check_full_name
    ) INTO name_exists;
    
    -- Get the role of user with this name (if phone didn't find a role)
    IF found_role IS NULL THEN
      SELECT role INTO found_role 
      FROM public.user_profiles 
      WHERE full_name = check_full_name 
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN QUERY SELECT email_exists, phone_exists, name_exists, found_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_duplicate_credentials(TEXT, TEXT, TEXT) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Duplicate credential check function created successfully!';
  RAISE NOTICE 'You can now check for duplicate users during signup.';
END $$;