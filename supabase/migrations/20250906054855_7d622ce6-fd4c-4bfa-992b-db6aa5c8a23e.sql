-- Create provider services using correct user_profiles.id references
WITH provider_data AS (
  SELECT 
    up.id as profile_id,
    sp.business_name,
    ROW_NUMBER() OVER (ORDER BY sp.business_name) as rn
  FROM user_profiles up
  INNER JOIN service_providers sp ON up.user_id = sp.user_id
  WHERE sp.status = 'approved'
),
subcategory_data AS (
  SELECT 
    id as subcategory_id,
    name,
    min_price,
    max_price,
    ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM subcategories 
  WHERE is_active = true
  LIMIT 8  -- Limit subcategories for better distribution
)
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
  p.profile_id,
  s.subcategory_id,
  'Professional ' || s.name,
  'Expert ' || s.name || ' services with quality guarantee and professional tools',
  GREATEST(s.min_price, (s.min_price + s.max_price) / 2 + (RANDOM() * 50 - 25)::numeric(10,2)),
  'approved',
  true
FROM provider_data p
CROSS JOIN subcategory_data s
WHERE (p.rn + s.rn) % 2 = 0  -- Create varied distribution
LIMIT 15;