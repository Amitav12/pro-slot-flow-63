-- Create sample service providers using existing user IDs
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
)
SELECT 
  user_id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN 'Elite Home Services'
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 2 THEN 'Professional Repairs'
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 3 THEN 'Expert Services Co'
    ELSE 'Quality Solutions'
  END as business_name,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN 'John Smith'
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 2 THEN 'Sarah Johnson'
    WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 3 THEN 'Mike Wilson'
    ELSE 'Lisa Brown'
  END as contact_person,
  '+1-555-010' || ROW_NUMBER() OVER (ORDER BY user_id) as phone,
  'contact@business' || ROW_NUMBER() OVER (ORDER BY user_id) || '.com' as email,
  (ROW_NUMBER() OVER (ORDER BY user_id) * 123) || ' Main St, Downtown' as address,
  'approved',
  4.5 + (RANDOM() * 0.5),
  (RANDOM() * 200 + 50)::integer,
  (RANDOM() * 150 + 50)::integer,
  (RANDOM() * 30 + 15)::integer
FROM user_profiles 
WHERE role = 'provider' OR role = 'customer'
LIMIT 3;

-- Create sample services for existing subcategories
INSERT INTO services (name, description, price, duration_minutes, subcategory_id, is_popular, is_active)
SELECT 
  'Professional ' || s.name,
  'High quality ' || COALESCE(s.description, s.name || ' service'),
  (s.min_price + s.max_price) / 2,
  60,
  s.id,
  CASE WHEN s.name IN ('Plumbing', 'Cleaning', 'General Consultation') THEN true ELSE false END,
  true
FROM subcategories s
WHERE s.is_active = true
LIMIT 10;