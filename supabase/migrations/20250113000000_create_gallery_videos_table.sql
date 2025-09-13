-- Create gallery_videos table for admin video gallery management
CREATE TABLE IF NOT EXISTS gallery_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  mime_type VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_videos_active ON gallery_videos(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_created_at ON gallery_videos(created_at DESC);

-- Enable RLS
ALTER TABLE gallery_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_videos
-- Admin can do everything
CREATE POLICY "Admin can manage gallery videos" ON gallery_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Public can view active videos
CREATE POLICY "Public can view active gallery videos" ON gallery_videos
  FOR SELECT USING (is_active = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_gallery_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_videos_updated_at_trigger
  BEFORE UPDATE ON gallery_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_videos_updated_at();