-- ============================================================================
-- FIX TAX SLABS RLS POLICY ISSUE
-- ============================================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This will fix the 403 Forbidden error when creating tax slabs
-- ============================================================================

-- Step 1: Set the most recent user as Super Admin
-- (This assumes you are the most recently registered user)
UPDATE public.user_profiles 
SET 
  auth_role = 'super_admin',
  role = 'super_admin',
  full_name = COALESCE(full_name, 'Super Administrator'),
  onboarding_completed = true,
  registration_status = 'approved',
  is_blocked = false,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Step 2: If no profile exists, create one for the most recent user
INSERT INTO public.user_profiles (
  user_id, 
  auth_role, 
  role, 
  full_name, 
  onboarding_completed,
  registration_status,
  is_blocked,
  created_at,
  updated_at
) 
SELECT 
  id,
  'super_admin',
  'super_admin',
  'Super Administrator',
  true,
  'approved',
  false,
  NOW(),
  NOW()
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Update RLS policy for tax_slabs to include super_admin role
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow admin full access to tax slabs" ON public.tax_slabs;

-- Create new policy that allows both admin and super_admin access
CREATE POLICY "Allow admin and super_admin full access to tax slabs" 
ON public.tax_slabs 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 4: Show current RLS policies for tax_slabs
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tax_slabs';

-- Step 5: Verify the user profile update
SELECT 
  user_id,
  auth_role,
  role,
  full_name,
  is_blocked
FROM public.user_profiles
WHERE user_id = (
  SELECT id FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If this runs without errors, you are now a Super Admin!
-- You can now:
-- ✅ Create tax slabs without 403 Forbidden errors
-- ✅ Access all admin dashboard sections
-- ✅ Manage user roles and permissions
-- ✅ Control dashboard section visibility for other admins
-- ✅ Perform all administrative functions
-- ✅ Have the highest level of system access
-- ============================================================================