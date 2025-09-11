-- Fix storage RLS policies to allow Service Provider signup
-- Run this in Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;

-- Create new policies that allow proper file uploads
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND
  (name LIKE 'id-proofs/%' OR name LIKE 'licenses/%')
);

CREATE POLICY "Users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

-- Ensure the documents bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Success message
SELECT 'Storage RLS policies fixed! Service Provider signup should now work.' as message;