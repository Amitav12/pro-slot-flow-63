-- Add sample provider registration requests for testing

-- First, let's get some user IDs and category IDs to use
DO $$
DECLARE
    sample_user_id UUID;
    sample_category_id UUID;
    cleaning_category_id UUID;
    beauty_category_id UUID;
BEGIN
    -- Get a sample user ID (preferably a customer who could become a provider)
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO cleaning_category_id FROM categories WHERE name ILIKE '%clean%' LIMIT 1;
    SELECT id INTO beauty_category_id FROM categories WHERE name ILIKE '%beauty%' OR name ILIKE '%spa%' LIMIT 1;
    SELECT id INTO sample_category_id FROM categories LIMIT 1;
    
    -- If we don't have the specific categories, use any available category
    IF cleaning_category_id IS NULL THEN
        cleaning_category_id := sample_category_id;
    END IF;
    
    IF beauty_category_id IS NULL THEN
        beauty_category_id := sample_category_id;
    END IF;
    
    -- Insert sample provider registration requests
    INSERT INTO provider_registration_requests (
        user_id,
        category_id,
        business_name,
        contact_person,
        phone,
        email,
        address,
        license_number,
        experience_years,
        description,
        status,
        created_at
    ) VALUES 
    (
        sample_user_id,
        cleaning_category_id,
        'Elite Cleaning Services',
        'Sarah Johnson',
        '+1-555-0123',
        'sarah@elitecleaning.com',
        '123 Main Street, Downtown City, State 12345',
        'CL-2024-001',
        5,
        'Professional cleaning service with 5 years of experience. We specialize in residential and commercial cleaning with eco-friendly products.',
        'pending',
        NOW() - INTERVAL '2 days'
    ),
    (
        sample_user_id,
        beauty_category_id,
        'Beauty Masters Spa',
        'Lisa Chen',
        '+1-555-0456',
        'lisa@beautymasters.com',
        '456 Beauty Boulevard, Spa District, State 12345',
        'BT-2024-002',
        8,
        'Full-service beauty spa offering facial treatments, massages, and wellness services. Licensed aesthetician with 8 years of experience.',
        'pending',
        NOW() - INTERVAL '1 day'
    ),
    (
        sample_user_id,
        sample_category_id,
        'Pro Home Repairs',
        'Mike Wilson',
        '+1-555-0789',
        'mike@prohomerepairs.com',
        '789 Repair Street, Service Area, State 12345',
        'HR-2024-003',
        12,
        'Experienced home repair and maintenance service. Specializing in plumbing, electrical, and general handyman services.',
        'approved',
        NOW() - INTERVAL '5 days'
    ),
    (
        sample_user_id,
        cleaning_category_id,
        'Quick Clean Co',
        'Maria Garcia',
        '+1-555-0321',
        'maria@quickclean.com',
        '321 Fast Lane, Quick City, State 12345',
        'QC-2024-004',
        3,
        'Fast and reliable cleaning services for busy professionals. Same-day service available.',
        'rejected',
        NOW() - INTERVAL '7 days'
    );
    
    -- Update the rejected request with a rejection reason
    UPDATE provider_registration_requests 
    SET 
        rejection_reason = 'Insufficient experience documentation provided. Please resubmit with proper certifications.',
        rejected_at = NOW() - INTERVAL '6 days',
        rejected_by = (
            SELECT up.user_id 
            FROM user_profiles up 
            WHERE up.auth_role IN ('admin', 'super_admin') 
            LIMIT 1
        )
    WHERE business_name = 'Quick Clean Co';
    
    -- Update the approved request with approval details
    UPDATE provider_registration_requests 
    SET 
        approved_at = NOW() - INTERVAL '4 days',
        approved_by = (
            SELECT up.user_id 
            FROM user_profiles up 
            WHERE up.auth_role IN ('admin', 'super_admin') 
            LIMIT 1
        )
    WHERE business_name = 'Pro Home Repairs';
    
    RAISE NOTICE 'Sample provider registration requests created successfully';
END $$;