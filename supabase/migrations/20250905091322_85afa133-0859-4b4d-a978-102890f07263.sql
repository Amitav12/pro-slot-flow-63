-- Let's create sample data without foreign key constraints issues
-- First, let's insert sample service providers with NULL user_id (if nullable)
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
  ('Elite Home Cleaning', 'Sarah Johnson', '+1-555-0101', 'sarah@elitehome.com', '123 Main St, City', 'approved', 4.8, 150, 200, 15),
  ('Pro Plumbers Inc', 'Mike Wilson', '+1-555-0102', 'mike@proplumbers.com', '456 Oak Ave, City', 'approved', 4.6, 89, 120, 20),
  ('Beauty Masters', 'Lisa Chen', '+1-555-0103', 'lisa@beautymasters.com', '789 Beauty Blvd, City', 'approved', 4.9, 320, 400, 10),
  ('Home Repair Pros', 'David Smith', '+1-555-0104', 'david@homerepair.com', '321 Fix St, City', 'approved', 4.7, 95, 110, 25),
  ('Quick Delivery', 'Maria Garcia', '+1-555-0105', 'maria@quickdelivery.com', '654 Speed Ave, City', 'approved', 4.5, 78, 85, 12);

-- Now let's create provider services using actual provider IDs and subcategory IDs
DO $$
DECLARE
    provider_rec RECORD;
    subcat_rec RECORD;
    counter INTEGER := 0;
BEGIN
    -- Create services for each provider with available subcategories
    FOR provider_rec IN SELECT id, business_name FROM service_providers ORDER BY created_at
    LOOP
        counter := counter + 1;
        
        -- Get a subcategory for this provider (round-robin style)
        SELECT id, name INTO subcat_rec 
        FROM subcategories 
        WHERE is_active = true 
        ORDER BY id 
        OFFSET (counter - 1) % (SELECT COUNT(*) FROM subcategories WHERE is_active = true) 
        LIMIT 1;
        
        IF subcat_rec.id IS NOT NULL THEN
            -- Create 2 services per provider
            INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
            VALUES 
                (provider_rec.id, subcat_rec.id, 
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 'Deep House Cleaning'
                   WHEN 'Pro Plumbers Inc' THEN 'Emergency Plumbing'
                   WHEN 'Beauty Masters' THEN 'Hair Styling'
                   WHEN 'Home Repair Pros' THEN 'Home Repairs'
                   WHEN 'Quick Delivery' THEN 'Package Delivery'
                   ELSE 'Professional Service'
                 END,
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 'Complete deep cleaning service for your home'
                   WHEN 'Pro Plumbers Inc' THEN '24/7 emergency plumbing services'
                   WHEN 'Beauty Masters' THEN 'Professional hair cutting and styling'
                   WHEN 'Home Repair Pros' THEN 'General home repair and maintenance'
                   WHEN 'Quick Delivery' THEN 'Fast and reliable package delivery'
                   ELSE 'High-quality professional service'
                 END,
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 150.00
                   WHEN 'Pro Plumbers Inc' THEN 200.00
                   WHEN 'Beauty Masters' THEN 60.00
                   WHEN 'Home Repair Pros' THEN 100.00
                   WHEN 'Quick Delivery' THEN 25.00
                   ELSE 100.00
                 END,
                 'approved', true),
                
                (provider_rec.id, subcat_rec.id,
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 'Regular House Cleaning'
                   WHEN 'Pro Plumbers Inc' THEN 'Pipe Installation'
                   WHEN 'Beauty Masters' THEN 'Facial Treatment'
                   WHEN 'Home Repair Pros' THEN 'Minor Repairs'
                   WHEN 'Quick Delivery' THEN 'Express Delivery'
                   ELSE 'Expert Service'
                 END,
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 'Weekly or bi-weekly house cleaning'
                   WHEN 'Pro Plumbers Inc' THEN 'Professional pipe installation and repair'
                   WHEN 'Beauty Masters' THEN 'Relaxing facial treatment and skincare'
                   WHEN 'Home Repair Pros' THEN 'Quick fixes and minor repairs'
                   WHEN 'Quick Delivery' THEN 'Same-day express delivery'
                   ELSE 'Expert level service with guarantee'
                 END,
                 CASE provider_rec.business_name
                   WHEN 'Elite Home Cleaning' THEN 80.00
                   WHEN 'Pro Plumbers Inc' THEN 120.00
                   WHEN 'Beauty Masters' THEN 90.00
                   WHEN 'Home Repair Pros' THEN 75.00
                   WHEN 'Quick Delivery' THEN 35.00
                   ELSE 150.00
                 END,
                 'approved', true);
        END IF;
    END LOOP;
END $$;