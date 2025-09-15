-- Create provider_categories table to link providers with categories
CREATE TABLE IF NOT EXISTS provider_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, category_id)
);

-- Add RLS policies for provider_categories
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own category registrations
CREATE POLICY "Providers can manage their own categories" ON provider_categories
FOR ALL USING (
  provider_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can manage all provider categories
CREATE POLICY "Admins can manage all provider categories" ON provider_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public can view approved provider categories
CREATE POLICY "Public can view provider categories" ON provider_categories
FOR SELECT USING (true);

-- Create storage bucket for licenses if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for licenses bucket
CREATE POLICY "Providers can upload their own licenses" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'licenses' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can view their own licenses" ON storage.objects
FOR SELECT USING (
  bucket_id = 'licenses' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all licenses" ON storage.objects
FOR SELECT USING (
  bucket_id = 'licenses' AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_provider_categories_updated_at
  BEFORE UPDATE ON provider_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();