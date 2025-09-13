-- Create gallery_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS gallery_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on gallery_videos table
ALTER TABLE gallery_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_videos table
CREATE POLICY "Allow admins to manage gallery videos" ON gallery_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Create policy for public read access to gallery videos
CREATE POLICY "Allow public read access to gallery videos" ON gallery_videos
  FOR SELECT USING (true);

-- Create the storage bucket for gallery videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery', 
  true,
  52428800, -- 50MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the gallery bucket
CREATE POLICY "Allow admins to upload gallery videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow admins to update gallery videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow admins to delete gallery videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow public read access to gallery videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- Create updated_at trigger for gallery_videos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_videos_updated_at BEFORE UPDATE ON gallery_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();