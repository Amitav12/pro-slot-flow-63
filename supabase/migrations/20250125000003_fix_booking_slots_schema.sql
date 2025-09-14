-- Fix booking_slots table schema to match function expectations
-- Add missing updated_at column and ensure all columns exist

-- Add updated_at column if it doesn't exist
ALTER TABLE public.booking_slots 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Ensure all required columns exist with proper types
ALTER TABLE public.booking_slots 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS provider_id UUID,
ADD COLUMN IF NOT EXISTS service_id UUID,
ADD COLUMN IF NOT EXISTS slot_date DATE,
ADD COLUMN IF NOT EXISTS slot_time TIME,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_by UUID,
ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS held_by UUID,
ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS booking_id UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Set primary key if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_slots_pkey') THEN
        ALTER TABLE public.booking_slots ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Check constraint for status
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_slots_status_check') THEN
        ALTER TABLE public.booking_slots ADD CONSTRAINT booking_slots_status_check 
        CHECK (status IN ('available', 'held', 'booked'));
    END IF;
END $$;

-- Create or replace the get_available_slots function with correct return type
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_provider_id UUID,
  p_service_id UUID,
  p_date DATE
)
RETURNS TABLE(
  id UUID,
  provider_id UUID,
  service_id UUID,
  slot_date DATE,
  slot_time TIME,
  status TEXT,
  is_blocked BOOLEAN,
  blocked_by UUID,
  blocked_until TIMESTAMP WITH TIME ZONE,
  held_by UUID,
  hold_expires_at TIMESTAMP WITH TIME ZONE,
  booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up expired holds first
  UPDATE public.booking_slots 
  SET status = 'available', held_by = NULL, hold_expires_at = NULL, updated_at = NOW()
  WHERE status = 'held' AND hold_expires_at < NOW();

  RETURN QUERY
  SELECT 
    bs.id,
    bs.provider_id,
    bs.service_id,
    bs.slot_date,
    bs.slot_time,
    bs.status,
    bs.is_blocked,
    bs.blocked_by,
    bs.blocked_until,
    bs.held_by,
    bs.hold_expires_at,
    bs.booking_id,
    bs.created_at,
    bs.updated_at
  FROM public.booking_slots bs
  WHERE bs.provider_id = p_provider_id
    AND (p_service_id IS NULL OR bs.service_id = p_service_id)
    AND bs.slot_date = p_date
    AND bs.status IN ('available', 'held')
    AND bs.is_blocked = false
  ORDER BY bs.slot_time;
END;
$$;

-- Create or replace the generate_provider_slots function
CREATE OR REPLACE FUNCTION public.generate_provider_slots(
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  curr_date DATE := p_start_date;
  slot_time TIME;
  availability_record RECORD;
BEGIN
  -- Loop through each date in the range
  WHILE curr_date <= p_end_date LOOP
    -- Check if provider has availability for this day
    SELECT * INTO availability_record
    FROM public.provider_availability 
    WHERE provider_id = p_provider_id 
      AND day_of_week = EXTRACT(dow FROM curr_date)
      AND is_available = true;
    
    -- If availability exists, generate slots
    IF FOUND THEN
      -- Generate 30-minute slots from start_time to end_time
      slot_time := availability_record.start_time;
      
      WHILE slot_time < availability_record.end_time LOOP
        -- Insert slot if it doesn't already exist
        INSERT INTO public.booking_slots (
          provider_id,
          slot_date,
          slot_time,
          status,
          is_blocked,
          created_at,
          updated_at
        )
        VALUES (
          p_provider_id,
          curr_date,
          slot_time,
          'available',
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (provider_id, slot_date, slot_time) DO NOTHING;
        
        -- Move to next slot (30 minutes later)
        slot_time := slot_time + INTERVAL '30 minutes';
      END LOOP;
    END IF;
    
    -- Move to next date
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
END;
$$;

-- Add trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_booking_slots_updated_at ON public.booking_slots;
CREATE TRIGGER update_booking_slots_updated_at
    BEFORE UPDATE ON public.booking_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_available_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_provider_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_provider_slots TO service_role;

-- Create unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_provider_slot') THEN
        ALTER TABLE public.booking_slots 
        ADD CONSTRAINT unique_provider_slot 
        UNIQUE (provider_id, slot_date, slot_time);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_slots_provider_date ON public.booking_slots(provider_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_held_by ON public.booking_slots(held_by);
CREATE INDEX IF NOT EXISTS idx_booking_slots_expires ON public.booking_slots(hold_expires_at);