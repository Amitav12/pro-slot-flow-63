-- Add RLS policies to allow admins to view all user profiles

-- Allow admins and super_admins to view all user profiles
CREATE POLICY "Admins can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.auth_role IN ('admin', 'super_admin')
  )
);

-- Allow admins and super_admins to update any user profile  
CREATE POLICY "Admins can update any user profile" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.auth_role IN ('admin', 'super_admin')
  )
);

-- Allow admins and super_admins to delete any user profile
CREATE POLICY "Admins can delete any user profile" 
ON public.user_profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_profile
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.auth_role IN ('admin', 'super_admin')
  )
);