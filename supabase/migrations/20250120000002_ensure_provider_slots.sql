-- Ensure all approved service providers have default availability and slots

-- First, ensure provider_availability table exists with correct structure
CREATE TABLE IF NOT EXISTS public.provider_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    is_available BOOLEAN DEFAULT true,
    slot_duration INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, day_of_week)
);

-- Enable RLS on provider_availability
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provider_availability if they don't exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Providers can manage their own availability" ON public.provider_availability;
    DROP POLICY IF EXISTS "Anyone can view provider availability" ON public.provider_availability;
    
    -- Create new policies
    CREATE POLICY "Providers can manage their own availability" ON public.provider_availability
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles 
                WHERE user_profiles.id = provider_availability.provider_id 
                AND user_profiles.user_id = auth.uid()
            )
        );

    CREATE POLICY "Anyone can view provider availability" ON public.provider_availability
        FOR SELECT USING (true);
EXCEPTION
    WHEN others THEN
        -- Policies might already exist, continue
        NULL;
END $$;

-- Insert default availability for all approved service providers (9 AM to 5 PM, Monday to Friday)
INSERT INTO public.provider_availability (provider_id, day_of_week, start_time, end_time, is_available, slot_duration)
SELECT 
    up.id as provider_id,
    day_num as day_of_week,
    '09:00:00'::time as start_time,
    '17:00:00'::time as end_time,
    true as is_available,
    30 as slot_duration
FROM public.user_profiles up
INNER JOIN public.service_providers sp ON sp.user_id = up.user_id
CROSS JOIN generate_series(1, 5) as day_num  -- Monday to Friday (1-5)
WHERE sp.status = 'approved'
ON CONFLICT (provider_id, day_of_week) DO NOTHING;

-- Also add weekend availability (Saturday and Sunday) as unavailable by default
INSERT INTO public.provider_availability (provider_id, day_of_week, start_time, end_time, is_available, slot_duration)
SELECT 
    up.id as provider_id,
    day_num as day_of_week,
    '09:00:00'::time as start_time,
    '17:00:00'::time as end_time,
    false as is_available,  -- Weekends unavailable by default
    30 as slot_duration
FROM public.user_profiles up
INNER JOIN public.service_providers sp ON sp.user_id = up.user_id
CROSS JOIN generate_series(0, 0) as day_num  -- Sunday (0)
UNION ALL
SELECT 
    up.id as provider_id,
    6 as day_of_week,  -- Saturday (6)
    '09:00:00'::time as start_time,
    '17:00:00'::time as end_time,
    false as is_available,
    30 as slot_duration
FROM public.user_profiles up
INNER JOIN public.service_providers sp ON sp.user_id = up.user_id
WHERE sp.status = 'approved'
ON CONFLICT (provider_id, day_of_week) DO NOTHING;

-- Generate slots for the next 60 days for all approved providers
DO $$
DECLARE
    provider_record RECORD;
    start_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '60 days';
BEGIN
    FOR provider_record IN 
        SELECT up.id 
        FROM public.user_profiles up
        INNER JOIN public.service_providers sp ON sp.user_id = up.user_id
        WHERE sp.status = 'approved'
    LOOP
        -- Call the generate_provider_slots function
        PERFORM generate_provider_slots(
            provider_record.id,
            start_date,
            end_date::DATE
        );
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_day ON public.provider_availability(provider_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_provider_availability_available ON public.provider_availability(is_available);