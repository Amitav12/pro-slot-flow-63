-- Create gallery storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for gallery bucket
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated users to upload videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery');

-- Allow public read access to videos
CREATE POLICY "Allow public read access to videos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'gallery');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete videos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'gallery');

-- Allow authenticated users to update video metadata
CREATE POLICY "Allow authenticated users to update videos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'gallery');