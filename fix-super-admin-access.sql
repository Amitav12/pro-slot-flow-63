-- ============================================================================
-- FIX SUPER ADMIN ACCESS AND RLS POLICY ISSUE
-- ============================================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This will set you as super admin and fix the platform_fees RLS issue
-- ============================================================================

-- Step 1: Set the most recent user as Super Admin
-- (This assumes you are the most recently registered user)
-- IMPORTANT: Setting as 'super_admin' - has all admin permissions plus dashboard control
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

-- Step 3: Verify the super admin was created
SELECT 
  up.user_id,
  au.email,
  up.auth_role,
  up.role,
  up.full_name,
  up.onboarding_completed
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.auth_role IN ('admin', 'super_admin') OR up.role IN ('admin', 'super_admin');

-- Step 4: Test platform_fees access (this should now work)
-- Uncomment the lines below to test inserting a platform fee
/*
INSERT INTO public.platform_fees (
  fee_type,
  fee_value,
  minimum_fee,
  maximum_fee,
  is_active,
  description
) VALUES (
  'percentage',
  2.5,
  1.00,
  50.00,
  true,
  'Test platform fee - Super Admin access verified'
);
*/

-- ============================================================================
-- EXPLANATION:
-- ============================================================================
-- The RLS policy on platform_fees table allows:
-- 1. Public READ access to active fees
-- 2. ADMIN FULL ACCESS (insert/update/delete) for users with role = 'admin'
-- 3. SUPER ADMIN access works because super_admin inherits admin permissions
--
-- Role Hierarchy:
-- - super_admin: Full access + dashboard section control for other admins
-- - admin: Full access to all features but cannot control dashboard sections
--
-- By setting your role to 'super_admin', you now have full access to:
-- - Create platform fees
-- - Update platform fees  
-- - Delete platform fees
-- - All other admin functions
-- ============================================================================

-- Step 5: Update RLS policy to include super_admin role
-- This ensures super_admin has the same access as admin
DROP POLICY IF EXISTS "Allow admin full access to platform fees" ON public.platform_fees;

CREATE POLICY "Allow admin and super_admin full access to platform fees" 
ON public.platform_fees 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 6: Show current RLS policies for reference
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
WHERE tablename = 'platform_fees';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If this runs without errors, you are now a Super Admin!
-- You can now:
-- ✅ Create platform fees without 403 Forbidden errors
-- ✅ Access all admin dashboard sections
-- ✅ Manage user roles and permissions
-- ✅ Control dashboard section visibility for other admins
-- ✅ Perform all administrative functions
-- ✅ Have the highest level of system access
-- ============================================================================