-- Simple RLS fix for development
-- Run this in Supabase SQL Editor if you see any permission errors

-- Disable RLS for development (you can re-enable later for production)
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS provider_services DISABLE ROW LEVEL SECURITY;

-- Drop any problematic policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON subcategories;
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON provider_services;

SELECT 'RLS disabled for development - Provider Dashboard should work now!' as status;