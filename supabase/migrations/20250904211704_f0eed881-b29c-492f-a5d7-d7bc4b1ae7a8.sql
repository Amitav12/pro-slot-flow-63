-- Add admin management section to admin_permissions table
INSERT INTO public.admin_permissions (section, display_name, description, is_enabled, sort_order)
VALUES ('admins', 'Admin Management', 'Manage admin users and their system permissions', true, 11)
ON CONFLICT (section) DO NOTHING;

-- Update provider approval workflow to handle both user_profiles and service_providers tables
CREATE OR REPLACE FUNCTION public.approve_provider(provider_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
    profile_record RECORD;
BEGIN
    -- Get the provider profile from user_profiles
    SELECT * INTO profile_record
    FROM public.user_profiles 
    WHERE user_id = provider_user_id AND role = 'provider';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Provider profile not found');
    END IF;
    
    -- Insert into service_providers table
    INSERT INTO public.service_providers (
        user_id,
        business_name,
        contact_person,
        phone,
        email,
        address,
        license_number,
        license_document_url,
        id_document_url,
        status,
        created_at
    )
    SELECT 
        profile_record.user_id,
        COALESCE(profile_record.business_name, 'Business Name'),
        COALESCE(profile_record.contact_person, profile_record.full_name, 'Contact Person'),
        COALESCE(profile_record.phone, 'N/A'),
        'provider@example.com', -- Default email since we can't access auth.users
        COALESCE(profile_record.address, 'Address'),
        profile_record.license_number,
        profile_record.license_document_url,
        profile_record.id_document_url,
        'approved',
        NOW()
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'approved',
        business_name = EXCLUDED.business_name,
        contact_person = EXCLUDED.contact_person,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        license_number = EXCLUDED.license_number,
        license_document_url = EXCLUDED.license_document_url,
        id_document_url = EXCLUDED.id_document_url;
    
    -- Update user_profiles registration_status
    UPDATE public.user_profiles 
    SET registration_status = 'approved'
    WHERE user_id = provider_user_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Provider approved successfully');
END;
$$;

-- Create function to reject provider
CREATE OR REPLACE FUNCTION public.reject_provider(provider_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Update user_profiles registration_status
    UPDATE public.user_profiles 
    SET registration_status = 'rejected'
    WHERE user_id = provider_user_id AND role = 'provider';
    
    -- Remove from service_providers if exists
    DELETE FROM public.service_providers WHERE user_id = provider_user_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Provider rejected successfully');
END;
$$;