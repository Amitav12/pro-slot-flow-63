-- ============================================================================
-- FIX SERVICE PROVIDER ROLE ASSIGNMENT
-- ============================================================================
-- This script corrects the role for service provider Amitav
-- who was incorrectly set as super_admin by the previous script
-- ============================================================================

-- Step 1: Update Amitav's role back to service_provider
UPDATE public.user_profiles 
SET 
  auth_role = 'service_provider',
  role = 'service_provider',
  full_name = 'Amitav',
  onboarding_completed = true,
  registration_status = 'approved',
  is_blocked = false,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'service@gmail.com'
  LIMIT 1
);

-- Step 2: Verify the change
SELECT 
  up.user_id,
  au.email,
  up.auth_role,
  up.role,
  up.full_name,
  up.onboarding_completed,
  up.registration_status
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'service@gmail.com';

-- Step 3: Show all current admin and super_admin users
SELECT 
  up.user_id,
  au.email,
  up.auth_role,
  up.role,
  up.full_name,
  up.onboarding_completed
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE up.auth_role IN ('admin', 'super_admin') OR up.role IN ('admin', 'super_admin')
ORDER BY up.created_at;

-- ============================================================================
-- EXPLANATION
-- ============================================================================
-- The previous fix-coupon-and-platform-fees.sql script automatically set
-- the most recent user as super_admin. This was intended for admin setup,
-- but it affected your service provider account instead.
-- 
-- This script corrects that by:
-- 1. Setting Amitav back to service_provider role
-- 2. Keeping their approved status
-- 3. Showing verification of the change
-- ============================================================================