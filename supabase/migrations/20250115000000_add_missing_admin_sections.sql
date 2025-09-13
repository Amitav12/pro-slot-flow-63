-- Add missing admin sections to admin_permissions table
INSERT INTO public.admin_permissions (section, display_name, description, is_enabled, sort_order) VALUES
  ('special-offers', 'Special Offers', 'Manage promotional offers and discounts', true, 12),
  ('video-gallery', 'Video Gallery', 'Manage video content and gallery', true, 13),
  ('service-management', 'Service Status Control', 'Control service status and availability', true, 14),
  ('popular-services', 'Popular Services', 'Manage featured and popular services', true, 15)
ON CONFLICT (section) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  sort_order = EXCLUDED.sort_order;