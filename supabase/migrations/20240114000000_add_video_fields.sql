-- Add is_active and description fields to gallery_videos table
ALTER TABLE gallery_videos 
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN description TEXT;

-- Update existing videos to be active by default
UPDATE gallery_videos SET is_active = true WHERE is_active IS NULL;

-- Add index for better performance when filtering active videos
CREATE INDEX idx_gallery_videos_active ON gallery_videos(is_active) WHERE is_active = true;