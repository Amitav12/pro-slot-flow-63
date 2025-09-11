-- Create sample services for existing subcategories
INSERT INTO services (name, description, price, duration_minutes, subcategory_id, is_popular, is_active)
SELECT 
  'Professional ' || s.name,
  'High quality ' || s.description,
  (s.min_price + s.max_price) / 2,
  60,
  s.id,
  CASE WHEN s.name IN ('Plumbing', 'Cleaning', 'General Consultation') THEN true ELSE false END,
  true
FROM subcategories s
WHERE s.is_active = true
LIMIT 10;

-- Create sample service providers
INSERT INTO service_providers (
  user_id, 
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
(gen_random_uuid(), 'Elite Home Services', 'John Smith', '+1-555-0101', 'john@elitehome.com', '123 Main St, Downtown', 'approved', 4.8, 156, 200, 15),
(gen_random_uuid(), 'Professional Repairs', 'Sarah Johnson', '+1-555-0102', 'sarah@prorepairs.com', '456 Oak Ave, Midtown', 'approved', 4.6, 89, 120, 30),
(gen_random_uuid(), 'Expert Services Co', 'Mike Wilson', '+1-555-0103', 'mike@expertservices.com', '789 Pine St, Uptown', 'approved', 4.9, 234, 400, 20),
(gen_random_uuid(), 'Quality Solutions', 'Lisa Brown', '+1-555-0104', 'lisa@qualitysolutions.com', '321 Elm St, Southside', 'approved', 4.7, 178, 150, 25),
(gen_random_uuid(), 'Premier Services', 'David Davis', '+1-555-0105', 'david@premierservices.com', '654 Maple Dr, Westside', 'approved', 4.5, 92, 75, 45);

-- Create provider services linking providers to subcategories
WITH provider_data AS (
  SELECT 
    user_id,
    business_name,
    ROW_NUMBER() OVER (ORDER BY business_name) as rn
  FROM service_providers 
  WHERE status = 'approved'
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
  p.user_id,
  s.subcategory_id,
  'Professional ' || s.name,
  'Expert ' || s.name || ' services with quality guarantee',
  (s.min_price + s.max_price) / 2 + (RANDOM() * 50 - 25)::numeric(10,2),
  'approved',
  true
FROM provider_data p
CROSS JOIN subcategory_data s
WHERE (p.rn + s.rn) % 3 != 0  -- Create varied distribution
LIMIT 25;