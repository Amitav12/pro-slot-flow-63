-- Fix security vulnerability: Restrict categories and subcategories write operations to admins only

-- Drop overly permissive policies on categories
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- Drop overly permissive policies on subcategories  
DROP POLICY IF EXISTS "Allow all operations on subcategories" ON subcategories;

-- Create secure policies for categories
-- Allow everyone to read categories
CREATE POLICY "Everyone can view categories" ON categories
FOR SELECT USING (true);

-- Only admins can insert categories
CREATE POLICY "Only admins can insert categories" ON categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Only admins can update categories
CREATE POLICY "Only admins can update categories" ON categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories" ON categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Create secure policies for subcategories
-- Allow everyone to read subcategories
CREATE POLICY "Everyone can view subcategories" ON subcategories
FOR SELECT USING (true);

-- Only admins can insert subcategories
CREATE POLICY "Only admins can insert subcategories" ON subcategories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Only admins can update subcategories
CREATE POLICY "Only admins can update subcategories" ON subcategories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Only admins can delete subcategories
CREATE POLICY "Only admins can delete subcategories" ON subcategories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND auth_role IN ('admin', 'super_admin')
  )
);

-- Verify security fix
SELECT 'Security vulnerability fixed: Categories and subcategories now require admin authentication for write operations' as message;