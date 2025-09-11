-- Manual SQL Script to Check Current RLS Policies and Storage Configuration
-- Run this in your Supabase SQL Editor and share the results

-- 1. Check if storage buckets exist
SELECT 
    'STORAGE BUCKETS' as check_type,
    id as bucket_name,
    name,
    public,
    created_at,
    updated_at
FROM storage.buckets
ORDER BY created_at;

-- 2. Check RLS status on storage tables
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename IN ('objects', 'buckets');

-- 3. Check current RLS policies on storage.objects
SELECT 
    'STORAGE.OBJECTS POLICIES' as check_type,
    policyname,
    cmd as command_type,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 4. Check current RLS policies on storage.buckets
SELECT 
    'STORAGE.BUCKETS POLICIES' as check_type,
    policyname,
    cmd as command_type,
    permissive,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'buckets'
ORDER BY policyname;

-- 5. Check if there are any objects in storage (if buckets exist)
SELECT 
    'STORAGE OBJECTS COUNT' as check_type,
    bucket_id,
    COUNT(*) as object_count
FROM storage.objects
GROUP BY bucket_id
UNION ALL
SELECT 
    'STORAGE OBJECTS COUNT' as check_type,
    'NO_OBJECTS' as bucket_id,
    0 as object_count
WHERE NOT EXISTS (SELECT 1 FROM storage.objects);

-- 6. Check authentication schema and tables
SELECT 
    'AUTH TABLES' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 7. Check if our custom tables exist
SELECT 
    'CUSTOM TABLES' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'service_providers', 'customers', 'services', 'bookings')
ORDER BY table_name;

-- 8. Check current database version and extensions
SELECT 
    'DATABASE INFO' as check_type,
    version() as postgres_version,
    current_database() as database_name,
    current_user as current_user_role;

-- 9. List all available extensions
SELECT 
    'EXTENSIONS' as check_type,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pgjwt')
ORDER BY extname;

-- Instructions:
-- 1. Copy this entire script
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Copy all the results and share them
-- 
-- This will show us:
-- - Whether storage buckets exist
-- - Current RLS policies
-- - Database structure
-- - What needs to be fixed