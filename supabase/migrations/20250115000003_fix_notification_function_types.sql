-- Fix type mismatch in get_providers_needing_availability_reminder function
-- This addresses the varchar vs text type error in column 2

CREATE OR REPLACE FUNCTION get_providers_needing_availability_reminder()
RETURNS TABLE (
    provider_id UUID,
    provider_name TEXT,
    email TEXT,
    phone TEXT,
    week_start DATE,
    reminder_days_advance INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id as provider_id,
        COALESCE(up.full_name::TEXT, 'Unknown Provider') as provider_name,
        COALESCE(au.email::TEXT, 'no-email@example.com') as email,
        COALESCE(up.phone::TEXT, 'N/A') as phone,
        (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::INTERVAL)::DATE as week_start,
        pnp.reminder_days_advance
    FROM public.user_profiles up
    JOIN public.provider_notification_preferences pnp ON up.id = pnp.provider_id
    JOIN auth.users au ON up.user_id = au.id
    WHERE up.role = 'service_provider'
        AND up.status = 'approved'
        AND pnp.availability_reminder_enabled = true
        AND NOT EXISTS (
            SELECT 1 FROM public.provider_weekly_availability pwa
            WHERE pwa.provider_id = up.id
                AND pwa.week_start = (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::INTERVAL)::DATE
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.provider_availability_notifications pan
            WHERE pan.provider_id = up.id
                AND pan.week_start = (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::INTERVAL)::DATE
                AND pan.sent_at > CURRENT_DATE - INTERVAL '1 day'
        );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_providers_needing_availability_reminder() TO authenticated;
GRANT EXECUTE ON FUNCTION get_providers_needing_availability_reminder() TO service_role;

-- Add comment
COMMENT ON FUNCTION get_providers_needing_availability_reminder IS 'Fixed version - Returns providers needing availability reminders with proper TEXT type casting';