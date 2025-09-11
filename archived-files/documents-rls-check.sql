-- Updated SQL Script to Check RLS Policies for Documents Storage
-- Run this in your Supabase SQL Editor and share the results

-- 1. Check if documents bucket exists
SELECT 
    'DOCUMENTS BUCKET' as check_type,
    id as bucket_name,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
WHERE id = 'documents'
UNION ALL
SELECT 
    'DOCUMENTS BUCKET' as check_type,
    'NOT_FOUND' as bucket_name,
    'Documents bucket does not exist' as name,
    null as public,
    null as file_size_limit,
    null as allowed_mime_types,
    null as created_at,
    null as updated_at
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- 2. Check RLS status on storage tables
SELECT 
    'RLS STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename IN ('objects', 'buckets');

-- 3. Check ALL RLS policies on storage.objects (focusing on documents)
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

-- 4. Check RLS policies on storage.buckets
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

-- 5. Check for any existing objects in documents bucket
SELECT 
    'DOCUMENTS OBJECTS' as check_type,
    name as file_name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'documents'
LIMIT 10
UNION ALL
SELECT 
    'DOCUMENTS OBJECTS' as check_type,
    'NO_FILES' as file_name,
    'documents' as bucket_id,
    null as owner,
    null as created_at,
    null as updated_at,
    null as last_accessed_at,
    null as metadata
WHERE NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'documents');

-- 6. Check authentication roles and permissions
SELECT 
    'AUTH ROLES' as check_type,
    rolname as role_name,
    rolsuper as is_superuser,
    rolinherit as can_inherit,
    rolcreaterole as can_create_roles,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login
FROM pg_roles
WHERE rolname IN ('authenticated', 'anon', 'service_role', 'supabase_admin')
ORDER BY rolname;

-- 7. Check for any policies that might affect documents bucket specifically
SELECT 
    'DOCUMENTS SPECIFIC POLICIES' as check_type,
    policyname,
    cmd as command_type,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (qual LIKE '%documents%' OR with_check LIKE '%documents%' OR policyname LIKE '%documents%')
ORDER BY policyname;

-- 8. Check current user and session info
SELECT 
    'SESSION INFO' as check_type,
    current_user as current_user_role,
    session_user as session_user_role,
    current_database() as database_name,
    inet_server_addr() as server_address,
    inet_server_port() as server_port;

-- 9. Check for any storage-related functions
SELECT 
    'STORAGE FUNCTIONS' as check_type,
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'storage'
ORDER BY routine_name;

-- Instructions:
-- 1. Copy this entire script
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Copy ALL the results and share them
-- 
-- This will show us:
-- - Whether the documents bucket exists and its configuration
-- - All RLS policies affecting storage.objects and storage.buckets
-- - Any existing files in the documents bucket
-- - Authentication roles and their permissions
-- - Any documents-specific policies
-- - Current session and user information