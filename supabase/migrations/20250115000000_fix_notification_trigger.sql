-- Fix notification trigger for provider registration requests

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_admin_new_provider_request ON public.provider_registration_requests;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.notify_admin_new_provider_request();

-- Recreate the notification function
CREATE OR REPLACE FUNCTION public.notify_admin_new_provider_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for admins
    INSERT INTO public.admin_notifications (
        id,
        type,
        title,
        message,
        data,
        created_at,
        read
    ) VALUES (
        gen_random_uuid(),
        'provider_registration',
        'New Provider Registration Request',
        'A new service provider has submitted a registration request for ' || NEW.category || ' services.',
        jsonb_build_object(
            'request_id', NEW.id,
            'provider_name', NEW.business_name,
            'category', NEW.category,
            'email', NEW.email
        ),
        NOW(),
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER trigger_notify_admin_new_provider_request
    AFTER INSERT ON public.provider_registration_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admin_new_provider_request();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_admin_new_provider_request() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_admin_new_provider_request() TO service_role;

-- Test notification (optional - remove if not needed)
-- INSERT INTO public.admin_notifications (
--     id,
--     type,
--     title,
--     message,
--     data,
--     created_at,
--     read
-- ) VALUES (
--     gen_random_uuid(),
--     'test',
--     'Test Notification',
--     'This is a test notification to verify the system is working.',
--     '{}',
--     NOW(),
--     false
-- );