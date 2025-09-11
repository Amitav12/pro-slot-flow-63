-- Fix RLS policies for development
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily for development
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use permissive policies
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might cause issues
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON subcategories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON subcategories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON subcategories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON subcategories;

DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON locations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON locations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON locations;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON user_profiles;

DROP POLICY IF EXISTS "Enable read access for all users" ON provider_services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON provider_services;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON provider_services;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON provider_services;

-- Create simple permissive policies if RLS is enabled
-- CREATE POLICY "Allow all operations" ON categories FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON subcategories FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON locations FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON provider_services FOR ALL USING (true) WITH CHECK (true);

SELECT 'RLS policies fixed for development!' as message;