-- Let's create a simple workaround by using user_profiles IDs instead
-- First, let's create a user profile that can be used for sample data
INSERT INTO user_profiles (
  user_id,
  full_name,
  role,
  auth_role,
  phone,
  business_name,
  contact_person,
  address,
  onboarding_completed
) VALUES 
  (gen_random_uuid(), 'Sample Provider', 'provider', 'provider', '+1-555-0100', 'Sample Home Services', 'John Smith', '123 Service St, City', true);

-- Now create provider_services using the user_profiles ID
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
  up.id,
  sc.id,
  'Sample Home Service',
  'Professional sample service for your home',
  99.99,
  'approved',
  true
FROM user_profiles up
CROSS JOIN subcategories sc
WHERE up.business_name = 'Sample Home Services'
  AND sc.is_active = true
ORDER BY sc.created_at
LIMIT 1;