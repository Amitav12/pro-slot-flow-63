-- Fix the incomplete trigger for provider registration notifications
-- This ensures notifications are created when new provider registration requests are submitted

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_admin_new_provider_request ON public.provider_registration_requests;

-- Recreate the trigger function to ensure it's properly defined
CREATE OR REPLACE FUNCTION public.notify_admin_new_provider_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for admins
  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    data,
    created_by
  ) VALUES (
    'provider_registration',
    'New Provider Registration Request',
    'A new service provider has submitted a registration request for ' || 
    COALESCE((SELECT name FROM public.categories WHERE id = NEW.category_id), 'Unknown Category'),
    jsonb_build_object(
      'request_id', NEW.id,
      'business_name', NEW.business_name,
      'category_id', NEW.category_id,
      'contact_person', NEW.contact_person
    ),
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_notify_admin_new_provider_request
  AFTER INSERT ON public.provider_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_provider_request();

-- Test the trigger by inserting a sample notification (optional)
-- This will help verify the notification system is working
INSERT INTO public.admin_notifications (
  type,
  title,
  message,
  data
) VALUES (
  'system_test',
  'Notification System Test',
  'This is a test notification to verify the admin notification system is working properly.',
  jsonb_build_object('test', true, 'timestamp', NOW())
);