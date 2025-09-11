-- First, let's check what categories and subcategories exist
-- Insert some sample service providers
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
  (gen_random_uuid(), 'Elite Home Cleaning', 'Sarah Johnson', '+1-555-0101', 'sarah@elitehome.com', '123 Main St, City', 'approved', 4.8, 150, 200, 15),
  (gen_random_uuid(), 'Pro Plumbers Inc', 'Mike Wilson', '+1-555-0102', 'mike@proplumbers.com', '456 Oak Ave, City', 'approved', 4.6, 89, 120, 20),
  (gen_random_uuid(), 'Beauty Masters', 'Lisa Chen', '+1-555-0103', 'lisa@beautymasters.com', '789 Beauty Blvd, City', 'approved', 4.9, 320, 400, 10),
  (gen_random_uuid(), 'Home Repair Pros', 'David Smith', '+1-555-0104', 'david@homerepair.com', '321 Fix St, City', 'approved', 4.7, 95, 110, 25),
  (gen_random_uuid(), 'Quick Delivery', 'Maria Garcia', '+1-555-0105', 'maria@quickdelivery.com', '654 Speed Ave, City', 'approved', 4.5, 78, 85, 12);

-- Now let's add provider services for these providers
-- We need to get actual subcategory IDs first
DO $$
DECLARE
    cleaning_subcat_id UUID;
    plumbing_subcat_id UUID;
    beauty_subcat_id UUID;
    repair_subcat_id UUID;
    delivery_subcat_id UUID;
    provider1_id UUID;
    provider2_id UUID;
    provider3_id UUID;
    provider4_id UUID;
    provider5_id UUID;
BEGIN
    -- Get subcategory IDs (assuming some common subcategories exist)
    SELECT id INTO cleaning_subcat_id FROM subcategories WHERE name ILIKE '%cleaning%' OR name ILIKE '%house%' LIMIT 1;
    SELECT id INTO plumbing_subcat_id FROM subcategories WHERE name ILIKE '%plumb%' OR name ILIKE '%pipe%' LIMIT 1;
    SELECT id INTO beauty_subcat_id FROM subcategories WHERE name ILIKE '%beauty%' OR name ILIKE '%salon%' LIMIT 1;
    SELECT id INTO repair_subcat_id FROM subcategories WHERE name ILIKE '%repair%' OR name ILIKE '%fix%' LIMIT 1;
    SELECT id INTO delivery_subcat_id FROM subcategories WHERE name ILIKE '%delivery%' OR name ILIKE '%transport%' LIMIT 1;
    
    -- Get provider IDs
    SELECT id INTO provider1_id FROM service_providers WHERE business_name = 'Elite Home Cleaning';
    SELECT id INTO provider2_id FROM service_providers WHERE business_name = 'Pro Plumbers Inc';
    SELECT id INTO provider3_id FROM service_providers WHERE business_name = 'Beauty Masters';
    SELECT id INTO provider4_id FROM service_providers WHERE business_name = 'Home Repair Pros';
    SELECT id INTO provider5_id FROM service_providers WHERE business_name = 'Quick Delivery';
    
    -- Insert services if subcategories exist
    IF cleaning_subcat_id IS NOT NULL THEN
        INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
        VALUES 
            (provider1_id, cleaning_subcat_id, 'Deep House Cleaning', 'Complete deep cleaning service for your home', 150.00, 'approved', true),
            (provider1_id, cleaning_subcat_id, 'Regular House Cleaning', 'Weekly or bi-weekly house cleaning', 80.00, 'approved', true);
    END IF;
    
    IF plumbing_subcat_id IS NOT NULL THEN
        INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
        VALUES 
            (provider2_id, plumbing_subcat_id, 'Emergency Plumbing', '24/7 emergency plumbing services', 200.00, 'approved', true),
            (provider2_id, plumbing_subcat_id, 'Pipe Installation', 'Professional pipe installation and repair', 120.00, 'approved', true);
    END IF;
    
    IF beauty_subcat_id IS NOT NULL THEN
        INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
        VALUES 
            (provider3_id, beauty_subcat_id, 'Hair Styling', 'Professional hair cutting and styling', 60.00, 'approved', true),
            (provider3_id, beauty_subcat_id, 'Facial Treatment', 'Relaxing facial treatment and skincare', 90.00, 'approved', true);
    END IF;
    
    IF repair_subcat_id IS NOT NULL THEN
        INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
        VALUES 
            (provider4_id, repair_subcat_id, 'Home Repairs', 'General home repair and maintenance', 100.00, 'approved', true);
    END IF;
    
    IF delivery_subcat_id IS NOT NULL THEN
        INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
        VALUES 
            (provider5_id, delivery_subcat_id, 'Package Delivery', 'Fast and reliable package delivery', 25.00, 'approved', true);
    END IF;
    
    -- If no matching subcategories, create at least one service with first available subcategory
    IF cleaning_subcat_id IS NULL AND plumbing_subcat_id IS NULL AND beauty_subcat_id IS NULL AND repair_subcat_id IS NULL AND delivery_subcat_id IS NULL THEN
        SELECT id INTO cleaning_subcat_id FROM subcategories LIMIT 1;
        IF cleaning_subcat_id IS NOT NULL THEN
            INSERT INTO provider_services (provider_id, subcategory_id, service_name, description, price, status, is_active)
            VALUES 
                (provider1_id, cleaning_subcat_id, 'Professional Service', 'High-quality professional service', 100.00, 'approved', true),
                (provider2_id, cleaning_subcat_id, 'Expert Service', 'Expert level service with guarantee', 150.00, 'approved', true);
        END IF;
    END IF;
END $$;