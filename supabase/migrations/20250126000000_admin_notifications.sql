-- Create admin notifications table for category approval requests
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'category_request',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    provider_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_name VARCHAR(255),
    category_name VARCHAR(255),
    license_number VARCHAR(255),
    license_document_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin notifications
CREATE POLICY "Admins can view all notifications" ON public.admin_notifications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.auth_role = ANY(ARRAY['admin', 'super_admin'])
    )
);

CREATE POLICY "System can insert notifications" ON public.admin_notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.auth_role = ANY(ARRAY['admin', 'super_admin'])
    )
);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_notifications_updated_at
    BEFORE UPDATE ON public.admin_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at 
    ON public.admin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read 
    ON public.admin_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type 
    ON public.admin_notifications(type);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT INSERT ON public.admin_notifications TO service_role;

-- Function to create admin notification for category requests
CREATE OR REPLACE FUNCTION create_category_request_notification(
    p_provider_id UUID,
    p_provider_name TEXT,
    p_category_name TEXT,
    p_license_number TEXT DEFAULT NULL,
    p_license_document_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        provider_id,
        provider_name,
        category_name,
        license_number,
        license_document_url
    )
    VALUES (
        'category_request',
        'New Category Request',
        'Provider ' || p_provider_name || ' has requested approval for category: ' || p_category_name,
        p_provider_id,
        p_provider_name,
        p_category_name,
        p_license_number,
        p_license_document_url
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_category_request_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_category_request_notification TO service_role;

-- Comment on table
COMMENT ON TABLE public.admin_notifications IS 'Stores notifications for admin dashboard including category approval requests';
COMMENT ON FUNCTION create_category_request_notification IS 'Creates a new admin notification when a provider requests category approval';