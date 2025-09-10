-- Add new fields to provider_services table for popular and new status
ALTER TABLE public.provider_services 
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gallery_images_urls jsonb DEFAULT '[]'::jsonb;

-- Update existing services with some sample popular/new flags using subqueries
UPDATE public.provider_services 
SET is_popular = true 
WHERE id IN (
    SELECT id FROM public.provider_services 
    WHERE total_bookings > 5 
    ORDER BY total_bookings DESC
    LIMIT 6
);

UPDATE public.provider_services 
SET is_new = true 
WHERE id IN (
    SELECT id FROM public.provider_services 
    WHERE created_at > (NOW() - INTERVAL '30 days')
    ORDER BY created_at DESC
    LIMIT 4
);