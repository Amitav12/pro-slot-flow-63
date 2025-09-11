-- Add RLS policies for admin_permissions table
CREATE POLICY "Super admins can view all admin permissions"
ON admin_permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.auth_role = 'super_admin'
  )
);

CREATE POLICY "Super admins can modify admin permissions"
ON admin_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.auth_role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.auth_role = 'super_admin'
  )
);

-- Allow regular admins to view permissions (for checking what they can access)
CREATE POLICY "Admins can view admin permissions"
ON admin_permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.auth_role IN ('admin', 'super_admin')
  )
);