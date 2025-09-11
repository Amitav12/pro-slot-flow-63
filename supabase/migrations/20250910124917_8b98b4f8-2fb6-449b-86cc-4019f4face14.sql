-- Allow public read for homepage settings while keeping admin-only for the rest
BEGIN;

-- Ensure RLS is enabled (it already is, but this is idempotent)
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anon/auth users to read only specific keys used by the homepage
DROP POLICY IF EXISTS "Public can view homepage settings" ON public.admin_settings;
CREATE POLICY "Public can view homepage settings"
ON public.admin_settings
FOR SELECT
USING (
  key IN (
    'hero_content',
    'company_info',
    'promotional_offers',
    'how_it_works',
    'service_guarantee',
    'site_stats',
    'video_carousel',
    'customer_testimonials'
  )
);

COMMIT;