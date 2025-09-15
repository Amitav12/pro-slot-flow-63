-- Create provider weekly availability table for advanced scheduling
CREATE TABLE IF NOT EXISTS public.provider_weekly_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    date DATE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    time_slots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, date)
);

-- Create provider notification preferences table
CREATE TABLE IF NOT EXISTS public.provider_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    availability_reminder_enabled BOOLEAN DEFAULT true,
    reminder_days_advance INTEGER DEFAULT 15,
    notification_time TIME DEFAULT '09:00:00',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id)
);

-- Create provider availability notifications log table
CREATE TABLE IF NOT EXISTS public.provider_availability_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'availability_reminder',
    week_start DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.provider_weekly_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provider_weekly_availability
CREATE POLICY "Providers can manage their own weekly availability" ON public.provider_weekly_availability
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.id = provider_weekly_availability.provider_id
    )
);

CREATE POLICY "Anyone can view provider weekly availability" ON public.provider_weekly_availability
FOR SELECT USING (true);

-- Create RLS policies for provider_notification_preferences
CREATE POLICY "Providers can manage their own notification preferences" ON public.provider_notification_preferences
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.id = provider_notification_preferences.provider_id
    )
);

-- Create RLS policies for provider_availability_notifications
CREATE POLICY "Providers can view their own notifications" ON public.provider_availability_notifications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.id = provider_availability_notifications.provider_id
    )
);

CREATE POLICY "System can insert notifications" ON public.provider_availability_notifications
FOR INSERT WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_provider_weekly_availability_updated_at
    BEFORE UPDATE ON public.provider_weekly_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_notification_preferences_updated_at
    BEFORE UPDATE ON public.provider_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get providers who need availability reminders
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

-- Function to create availability slots from weekly schedule
CREATE OR REPLACE FUNCTION create_slots_from_weekly_schedule(
    p_provider_id UUID,
    p_week_start DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    weekly_record RECORD;
    slot_time TIME;
    slot_duration INTERVAL := '2 hours';
BEGIN
    -- Get all weekly availability records for the provider and week
    FOR weekly_record IN 
        SELECT * FROM public.provider_weekly_availability
        WHERE provider_id = p_provider_id 
        AND week_start = p_week_start
        AND is_available = true
    LOOP
        -- Generate 2-hour slots for each available day
        slot_time := weekly_record.start_time;
        
        WHILE slot_time + slot_duration <= weekly_record.end_time LOOP
            -- Insert slot into booking_slots table
            INSERT INTO public.booking_slots (
                provider_id,
                slot_date,
                slot_time,
                status
            )
            VALUES (
                p_provider_id,
                weekly_record.date,
                slot_time,
                'available'
            )
            ON CONFLICT (provider_id, slot_date, slot_time) DO NOTHING;
            
            slot_time := slot_time + slot_duration;
        END LOOP;
    END LOOP;
END;
$$;

-- Function to send availability reminder notification
CREATE OR REPLACE FUNCTION send_availability_reminder(
    p_provider_id UUID,
    p_week_start DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    provider_record RECORD;
BEGIN
    -- Get provider details
    SELECT up.full_name, up.email, up.phone
    INTO provider_record
    FROM public.user_profiles up
    WHERE up.id = p_provider_id;
    
    -- Log the notification
    INSERT INTO public.provider_availability_notifications (
        provider_id,
        notification_type,
        week_start,
        status,
        message
    )
    VALUES (
        p_provider_id,
        'availability_reminder',
        p_week_start,
        'sent',
        'Reminder to set availability for week starting ' || p_week_start::TEXT
    );
    
    -- Here you would integrate with your notification service
    -- For now, we just log the notification
    RAISE NOTICE 'Availability reminder sent to provider % for week %', provider_record.full_name, p_week_start;
END;
$$;

-- Create default notification preferences for existing providers
INSERT INTO public.provider_notification_preferences (provider_id)
SELECT id FROM public.user_profiles 
WHERE role = 'service_provider' 
AND status = 'approved'
AND id NOT IN (SELECT provider_id FROM public.provider_notification_preferences)
ON CONFLICT (provider_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_weekly_availability_provider_week 
    ON public.provider_weekly_availability(provider_id, week_start);

CREATE INDEX IF NOT EXISTS idx_provider_weekly_availability_date 
    ON public.provider_weekly_availability(date);

CREATE INDEX IF NOT EXISTS idx_provider_availability_notifications_provider_week 
    ON public.provider_availability_notifications(provider_id, week_start);

CREATE INDEX IF NOT EXISTS idx_provider_availability_notifications_sent_at 
    ON public.provider_availability_notifications(sent_at);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_weekly_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_notification_preferences TO authenticated;
GRANT SELECT ON public.provider_availability_notifications TO authenticated;
GRANT INSERT ON public.provider_availability_notifications TO service_role;

-- Comment on tables
COMMENT ON TABLE public.provider_weekly_availability IS 'Stores provider availability schedules on a weekly basis with 15-day advance planning';
COMMENT ON TABLE public.provider_notification_preferences IS 'Stores provider preferences for availability reminder notifications';
COMMENT ON TABLE public.provider_availability_notifications IS 'Logs all availability reminder notifications sent to providers';