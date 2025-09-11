-- Add sample data to categories
DO $$
BEGIN
  -- Insert categories if they don't exist
  INSERT INTO categories (name, description, icon, is_active) 
  SELECT name, description, icon, is_active
  FROM (VALUES
    ('Cleaning', 'Professional home cleaning services', 'cleaning', true),
    ('Beauty & Personal Care', 'Beauty treatments and personal care services', 'sparkles', true),
    ('Home Services', 'Professional home maintenance and repair services', 'home', true),
    ('Health & Wellness', 'Healthcare and wellness services', 'heart', true),
    ('Technology', 'IT support and technology services', 'laptop', true),
    ('Automotive', 'Vehicle maintenance and repair services', 'car', true)
  ) AS new_categories(name, description, icon, is_active)
  WHERE NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.name = new_categories.name
  );

  -- Insert subcategories
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
    ('Beauty & Personal Care', 'Facial Treatment', 'Professional facial treatments', 150, 800, true),
    ('Beauty & Personal Care', 'Massage Therapy', 'Therapeutic massage services', 200, 1000, true),
    ('Home Services', 'Plumbing', 'Professional plumbing services', 150, 1000, true),
    ('Home Services', 'Electrical', 'Electrical repair and installation', 200, 1500, true),
    ('Health & Wellness', 'General Consultation', 'General health consultation', 100, 500, true),
    ('Technology', 'Computer Repair', 'Computer and laptop repair', 100, 800, true),
    ('Automotive', 'Car Wash', 'Professional car washing service', 20, 100, true)
  ) AS sub(category_name, name, description, min_price, max_price, is_active)
  JOIN categories c ON c.name = sub.category_name
  WHERE NOT EXISTS (
    SELECT 1 FROM subcategories s 
    WHERE s.category_id = c.id AND s.name = sub.name
  );

  -- Create sample provider services
  INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, duration_minutes, status, is_active, is_popular) 
  SELECT 
    gen_random_uuid(), -- Dummy provider ID for now
    s.id,
    service.name,
    service.description,
    service.price,
    service.duration,
    'approved',
    true,
    service.is_popular
  FROM (VALUES
    ('Deep Cleaning', 'Professional Deep Cleaning', 'Complete deep cleaning service for your home', 250.00, 180, true),
    ('Facial Treatment', 'Luxury Facial Treatment', 'Rejuvenating facial treatment with premium products', 400.00, 90, true),
    ('Plumbing', 'Emergency Plumbing Service', 'Quick and reliable plumbing repairs', 300.00, 120, false),
    ('Car Wash', 'Premium Car Wash', 'Complete car washing and detailing', 50.00, 60, true),
    ('Computer Repair', 'Laptop Repair Service', 'Professional laptop diagnosis and repair', 200.00, 90, false),
    ('Massage Therapy', 'Relaxation Massage', 'Full body relaxation massage therapy', 350.00, 75, true),
    ('Regular Cleaning', 'Weekly House Cleaning', 'Regular weekly cleaning service', 150.00, 120, true),
    ('Electrical', 'Electrical Installation', 'Safe electrical repairs and installations', 400.00, 90, false),
    ('General Consultation', 'Health Checkup', 'Comprehensive health consultation', 200.00, 45, false)
  ) AS service(subcategory_name, name, description, price, duration, is_popular)
  JOIN subcategories s ON s.name = service.subcategory_name
  WHERE NOT EXISTS (
    SELECT 1 FROM provider_services ps 
    WHERE ps.subcategory_id = s.id AND ps.service_name = service.name
  );
END $$;