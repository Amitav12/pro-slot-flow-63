-- Comprehensive Storage Fix for Service Provider Signup
-- This script must be run in Supabase SQL Editor with admin privileges

-- Step 1: Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Drop all existing problematic RLS policies on storage.objects
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from documents bucket" ON storage.objects;

-- Step 3: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new comprehensive RLS policies
-- Policy for uploading documents (INSERT)
CREATE POLICY "Allow authenticated uploads to documents bucket" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND
  (
    name LIKE 'id-proofs/%' OR 
    name LIKE 'licenses/%' OR
    name LIKE 'documents/%'
  )
);

-- Policy for viewing documents (SELECT)
CREATE POLICY "Allow authenticated reads from documents bucket" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Policy for updating documents (UPDATE)
CREATE POLICY "Allow authenticated updates to documents bucket" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Policy for deleting documents (DELETE)
CREATE POLICY "Allow authenticated deletes from documents bucket" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Step 5: Grant necessary permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Step 6: Also ensure RLS policies on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access the documents bucket
DROP POLICY IF EXISTS "Allow authenticated access to documents bucket" ON storage.buckets;
CREATE POLICY "Allow authenticated access to documents bucket" ON storage.buckets
FOR SELECT 
USING (
  id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Step 7: Verify the setup
SELECT 
  'Documents bucket created and RLS policies applied successfully!' as message,
  (
    SELECT COUNT(*) 
    FROM storage.buckets 
    WHERE id = 'documents'
  ) as bucket_exists,
  (
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%'
  ) as storage_policies_count;

-- Display current policies for verification
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
WHERE tablename IN ('objects', 'buckets') 
AND schemaname = 'storage'
ORDER BY tablename, policyname;