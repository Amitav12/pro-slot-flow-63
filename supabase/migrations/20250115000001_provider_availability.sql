-- Create provider availability table
CREATE TABLE IF NOT EXISTS public.provider_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    time_slots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, date)
);

-- Create time slots table for predefined slots
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert predefined time slots
INSERT INTO public.time_slots (slot_name, start_time, end_time, display_order) VALUES
('7:00 AM - 9:00 AM', '07:00:00', '09:00:00', 1),
('9:00 AM - 11:00 AM', '09:00:00', '11:00:00', 2),
('11:00 AM - 1:00 PM', '11:00:00', '13:00:00', 3),
('1:00 PM - 3:00 PM', '13:00:00', '15:00:00', 4),
('3:00 PM - 5:00 PM', '15:00:00', '17:00:00', 5)
ON CONFLICT DO NOTHING;

-- Create booking slots table (enhanced version)
CREATE TABLE IF NOT EXISTS public.booking_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.provider_services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked', 'blocked')),
    held_by UUID REFERENCES auth.users(id),
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    booked_by UUID REFERENCES auth.users(id),
    booking_id UUID REFERENCES public.bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, date, time_slot_id)
);

-- Enable RLS
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_availability
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

-- RLS Policies for time_slots
CREATE POLICY "Anyone can view time slots" ON public.time_slots
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage time slots" ON public.time_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for booking_slots
CREATE POLICY "Providers can manage their own booking slots" ON public.booking_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = booking_slots.provider_id 
            AND user_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view available booking slots" ON public.booking_slots
    FOR SELECT USING (true);

CREATE POLICY "Users can hold slots temporarily" ON public.booking_slots
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        (held_by IS NULL OR held_by = auth.uid() OR hold_expires_at < now())
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_date ON public.provider_availability(provider_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_provider_date ON public.booking_slots(provider_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_hold_expires ON public.booking_slots(hold_expires_at) WHERE status = 'held';

-- Create function to automatically release expired holds
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS void AS $$
BEGIN
    UPDATE public.booking_slots 
    SET 
        status = 'available',
        held_by = NULL,
        hold_expires_at = NULL,
        updated_at = now()
    WHERE 
        status = 'held' 
        AND hold_expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate availability slots for providers
CREATE OR REPLACE FUNCTION generate_provider_slots(
    p_provider_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS void AS $$
DECLARE
    current_date DATE;
    slot_record RECORD;
    availability_record RECORD;
BEGIN
    -- Loop through each date in the range
    current_date := p_start_date;
    WHILE current_date <= p_end_date LOOP
        -- Check if provider has availability set for this date
        SELECT * INTO availability_record 
        FROM public.provider_availability 
        WHERE provider_id = p_provider_id AND date = current_date;
        
        -- If provider is available for this date (or no record exists, default to available)
        IF availability_record IS NULL OR availability_record.is_available = true THEN
            -- Create booking slots for each time slot
            FOR slot_record IN 
                SELECT id FROM public.time_slots WHERE is_active = true ORDER BY display_order
            LOOP
                INSERT INTO public.booking_slots (
                    provider_id, 
                    date, 
                    time_slot_id, 
                    status
                )
                VALUES (
                    p_provider_id, 
                    current_date, 
                    slot_record.id, 
                    'available'
                )
                ON CONFLICT (provider_id, date, time_slot_id) DO NOTHING;
            END LOOP;
        END IF;
        
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER update_provider_availability_updated_at
    BEFORE UPDATE ON public.provider_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_slots_updated_at
    BEFORE UPDATE ON public.booking_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();