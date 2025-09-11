-- Add working hours and other fields to provider_services table
ALTER TABLE provider_services 
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id);

-- Create storage bucket for license documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for documents bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update provider_services RLS policies to allow providers to manage their own services
DROP POLICY IF EXISTS "Providers can manage their own services" ON provider_services;
CREATE POLICY "Providers can manage their own services" ON provider_services
FOR ALL USING (
  provider_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- Allow admins to manage all provider services
DROP POLICY IF EXISTS "Admins can manage all provider services" ON provider_services;
CREATE POLICY "Admins can manage all provider services" ON provider_services
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public to view approved services
DROP POLICY IF EXISTS "Public can view approved services" ON provider_services;
CREATE POLICY "Public can view approved services" ON provider_services
FOR SELECT USING (status = 'approved' AND is_active = true);