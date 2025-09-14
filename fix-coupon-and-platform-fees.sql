-- ============================================================================
-- FIX COUPON VALIDATION AND PLATFORM FEES RLS ISSUES
-- ============================================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This will fix the 404 coupon validation error and 403 platform fees error
-- ============================================================================

-- Step 1: Set the most recent user as Super Admin
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

-- Step 2: Create profile if it doesn't exist
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

-- Step 3: Update platform_fees RLS policy to include super_admin
DROP POLICY IF EXISTS "Allow admin full access to platform fees" ON public.platform_fees;
DROP POLICY IF EXISTS "Allow admin and super_admin full access to platform fees" ON public.platform_fees;

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

-- Step 4: Update tax_slabs RLS policy to include super_admin
DROP POLICY IF EXISTS "Allow admin full access to tax slabs" ON public.tax_slabs;
DROP POLICY IF EXISTS "Allow admin and super_admin full access to tax slabs" ON public.tax_slabs;

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
);

-- Step 5: Update special_offers RLS policy to allow customers to view active offers
DROP POLICY IF EXISTS "Allow public read access to active special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Allow admin full access to special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Allow admin and super_admin full access to special offers" ON public.special_offers;

-- Allow all users to view active special offers (for coupon validation)
CREATE POLICY "Allow public read access to active special offers" 
ON public.special_offers 
FOR SELECT 
TO public 
USING (is_active = true AND valid_from <= now() AND valid_until >= now());

-- Allow admin and super_admin full access to all special offers
CREATE POLICY "Allow admin and super_admin full access to special offers" 
ON public.special_offers 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 6: Update coupons RLS policy to allow customers to use coupons
DROP POLICY IF EXISTS "Allow users to view their own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin full access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow users to create their own coupon records" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin and super_admin full access to coupons" ON public.coupons;

-- Allow customers to insert their own coupon usage records
CREATE POLICY "Allow users to create their own coupon records" 
ON public.coupons 
FOR INSERT 
TO public 
WITH CHECK (customer_id = auth.uid());

-- Allow users to view their own coupon usage
CREATE POLICY "Allow users to view their own coupons" 
ON public.coupons 
FOR SELECT 
TO public 
USING (customer_id = auth.uid());

-- Allow admin and super_admin full access to all coupons
CREATE POLICY "Allow admin and super_admin full access to coupons" 
ON public.coupons 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 7: Verify the validate_coupon_code function exists and works correctly
-- The function should already exist from the migration, but let's ensure it's accessible
GRANT EXECUTE ON FUNCTION validate_coupon_code(text, uuid, numeric) TO public;

-- Step 8: Show current user status
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

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If this runs without errors, you should now be able to:
-- ✅ Use coupon validation without 404 errors
-- ✅ Create platform fees without 403 Forbidden errors
-- ✅ Access all admin dashboard sections
-- ✅ Manage all system settings as super admin
-- ============================================================================