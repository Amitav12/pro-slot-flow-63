-- First, add some sample data to categories if they don't exist already
INSERT INTO categories (name, description, icon, is_active) VALUES
('Cleaning', 'Professional home cleaning services', 'cleaning', true),
('Beauty & Personal Care', 'Beauty treatments and personal care services', 'sparkles', true),
('Home Services', 'Professional home maintenance and repair services', 'home', true),
('Health & Wellness', 'Healthcare and wellness services', 'heart', true),
('Technology', 'IT support and technology services', 'laptop', true),
('Automotive', 'Vehicle maintenance and repair services', 'car', true)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name IN ('Cleaning', 'Beauty & Personal Care', 'Home Services', 'Health & Wellness', 'Technology', 'Automotive'));

-- Now add subcategories for each category
INSERT INTO subcategories (category_id, name, description, min_price, max_price, is_active) 
SELECT 
  c.id, 
  sub.name, 
  sub.description, 
  sub.min_price, 
  sub.max_price, 
  sub.is_active
FROM (VALUES
  ('Cleaning', 'Deep Cleaning', 'Complete deep cleaning service', 100, 500, true),
  ('Cleaning', 'Regular Cleaning', 'Regular maintenance cleaning', 50, 200, true),
  ('Cleaning', 'Kitchen Cleaning', 'Specialized kitchen cleaning', 80, 300, true),
  ('Beauty & Personal Care', 'Facial Treatment', 'Professional facial treatments', 150, 800, true),
  ('Beauty & Personal Care', 'Hair Styling', 'Professional hair styling services', 100, 600, true),
  ('Beauty & Personal Care', 'Massage Therapy', 'Therapeutic massage services', 200, 1000, true),
  ('Home Services', 'Plumbing', 'Professional plumbing services', 150, 1000, true),
  ('Home Services', 'Electrical', 'Electrical repair and installation', 200, 1500, true),
  ('Home Services', 'HVAC', 'Heating and cooling services', 250, 2000, true),
  ('Health & Wellness', 'General Consultation', 'General health consultation', 100, 500, true),
  ('Health & Wellness', 'Mental Health', 'Mental health counseling', 200, 800, true),
  ('Technology', 'Computer Repair', 'Computer and laptop repair', 100, 800, true),
  ('Technology', 'Software Support', 'Software installation and support', 50, 400, true),
  ('Automotive', 'Car Wash', 'Professional car washing service', 20, 100, true),
  ('Automotive', 'Car Repair', 'Vehicle maintenance and repair', 200, 2000, true)
) AS sub(category_name, name, description, min_price, max_price, is_active)
JOIN categories c ON c.name = sub.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM subcategories s 
  WHERE s.category_id = c.id AND s.name = sub.name
);