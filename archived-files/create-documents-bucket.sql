-- Create storage bucket for documents (ID proofs, licenses, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for documents bucket
-- Allow authenticated users to upload to id-proofs and licenses folders
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

CREATE POLICY "Admins can view all documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;