-- Create sample service providers and services in a simple way
-- First, let's create just one sample provider and service to test

-- Insert one sample provider (avoiding foreign key issues by leaving user_id as NULL)
INSERT INTO service_providers (
  business_name,
  contact_person,
  phone,
  email,
  address,
  status,
  rating,
  total_reviews,
  total_completed_jobs,
  response_time_minutes
) VALUES 
  ('Sample Home Services', 'John Smith', '+1-555-0100', 'john@samplehome.com', '123 Service St, City', 'approved', 4.5, 25, 30, 20);

-- Now create a service for this provider using the first available subcategory
INSERT INTO provider_services (
  provider_id,
  subcategory_id,
  service_name,
  description,
  price,
  status,
  is_active
)
SELECT 
  sp.id,
  sc.id,
  'Sample Home Service',
  'Professional sample service for your home',
  99.99,
  'approved',
  true
FROM service_providers sp
CROSS JOIN subcategories sc
WHERE sp.business_name = 'Sample Home Services'
  AND sc.is_active = true
ORDER BY sc.created_at
LIMIT 1;