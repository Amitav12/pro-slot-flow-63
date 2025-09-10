-- Create default popular services configuration in admin_settings
INSERT INTO public.admin_settings (key, value, description) 
VALUES (
  'popular_services',
  '{
    "title": "Popular Services",
    "subtitle": "Most requested services in your area",
    "show_section": true,
    "service_ids": []
  }'::jsonb,
  'Configuration for popular services section on homepage'
) ON CONFLICT (key) DO NOTHING;