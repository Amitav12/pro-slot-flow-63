-- Create bookings table first
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.provider_services(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Create booking_slots table for managing time slot availability
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
    booking_id UUID, -- Removed foreign key constraint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, date, time_slot_id)
);

-- Enable RLS on booking_slots
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

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

-- Create provider_availability table if it doesn't exist
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

-- Enable RLS on provider_availability
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_date ON public.provider_availability(provider_id, date);