-- First, let's add some sample data to categories if they don't exist already
INSERT INTO categories (name, description, icon, is_active) VALUES
('Cleaning', 'Professional home cleaning services', 'cleaning', true),
('Beauty & Personal Care', 'Beauty treatments and personal care services', 'sparkles', true),
('Home Services', 'Professional home maintenance and repair services', 'home', true),
('Health & Wellness', 'Healthcare and wellness services', 'heart', true),
('Technology', 'IT support and technology services', 'laptop', true),
('Automotive', 'Vehicle maintenance and repair services', 'car', true)
ON CONFLICT (name) DO NOTHING;

-- Now add subcategories for each category
INSERT INTO subcategories (category_id, name, description, min_price, max_price, is_active) VALUES
-- Cleaning subcategories
((SELECT id FROM categories WHERE name = 'Cleaning'), 'Deep Cleaning', 'Complete deep cleaning service', 100, 500, true),
((SELECT id FROM categories WHERE name = 'Cleaning'), 'Regular Cleaning', 'Regular maintenance cleaning', 50, 200, true),
((SELECT id FROM categories WHERE name = 'Cleaning'), 'Kitchen Cleaning', 'Specialized kitchen cleaning', 80, 300, true),

-- Beauty subcategories  
((SELECT id FROM categories WHERE name = 'Beauty & Personal Care'), 'Facial Treatment', 'Professional facial treatments', 150, 800, true),
((SELECT id FROM categories WHERE name = 'Beauty & Personal Care'), 'Hair Styling', 'Professional hair styling services', 100, 600, true),
((SELECT id FROM categories WHERE name = 'Beauty & Personal Care'), 'Massage Therapy', 'Therapeutic massage services', 200, 1000, true),

-- Home Services subcategories
((SELECT id FROM categories WHERE name = 'Home Services'), 'Plumbing', 'Professional plumbing services', 150, 1000, true),
((SELECT id FROM categories WHERE name = 'Home Services'), 'Electrical', 'Electrical repair and installation', 200, 1500, true),
((SELECT id FROM categories WHERE name = 'Home Services'), 'HVAC', 'Heating and cooling services', 250, 2000, true),

-- Health & Wellness subcategories
((SELECT id FROM categories WHERE name = 'Health & Wellness'), 'General Consultation', 'General health consultation', 100, 500, true),
((SELECT id FROM categories WHERE name = 'Health & Wellness'), 'Mental Health', 'Mental health counseling', 200, 800, true),

-- Technology subcategories
((SELECT id FROM categories WHERE name = 'Technology'), 'Computer Repair', 'Computer and laptop repair', 100, 800, true),
((SELECT id FROM categories WHERE name = 'Technology'), 'Software Support', 'Software installation and support', 50, 400, true),

-- Automotive subcategories
((SELECT id FROM categories WHERE name = 'Automotive'), 'Car Wash', 'Professional car washing service', 20, 100, true),
((SELECT id FROM categories WHERE name = 'Automotive'), 'Car Repair', 'Vehicle maintenance and repair', 200, 2000, true)
ON CONFLICT (category_id, name) DO NOTHING;

-- Create some sample provider services
INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, duration_minutes, status, is_active, is_popular) VALUES
-- Get a sample provider (we'll use the first one or create a fallback)
(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Deep Cleaning' LIMIT 1),
 'Professional Deep Cleaning',
 'Complete deep cleaning service for your home including all rooms, kitchen, and bathrooms',
 250.00, 180, 'approved', true, true),

(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Facial Treatment' LIMIT 1),
 'Luxury Facial Treatment',
 'Rejuvenating facial treatment with premium skincare products',
 400.00, 90, 'approved', true, true),

(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Plumbing' LIMIT 1),
 'Emergency Plumbing Service',
 'Quick and reliable plumbing repairs and installations',
 300.00, 120, 'approved', true, false),

(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Car Wash' LIMIT 1),
 'Premium Car Wash',
 'Complete car washing and detailing service',
 50.00, 60, 'approved', true, true),

(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Computer Repair' LIMIT 1),
 'Laptop Repair Service',
 'Professional laptop diagnosis and repair service',
 200.00, 90, 'approved', true, false),

(COALESCE((SELECT id FROM user_profiles WHERE role = 'provider' LIMIT 1), gen_random_uuid()), 
 (SELECT id FROM subcategories WHERE name = 'Massage Therapy' LIMIT 1),
 'Relaxation Massage',
 'Full body relaxation massage therapy',
 350.00, 75, 'approved', true, true)
ON CONFLICT DO NOTHING;