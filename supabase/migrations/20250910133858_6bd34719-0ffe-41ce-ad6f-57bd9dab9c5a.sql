-- Add new fields to provider_services table for popular and new status
ALTER TABLE public.provider_services 
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gallery_images_urls jsonb DEFAULT '[]'::jsonb;

-- Update existing services with some sample popular/new flags
UPDATE public.provider_services 
SET is_popular = true 
WHERE total_bookings > 5 
LIMIT 6;

UPDATE public.provider_services 
SET is_new = true 
WHERE created_at > (NOW() - INTERVAL '30 days')
LIMIT 4;