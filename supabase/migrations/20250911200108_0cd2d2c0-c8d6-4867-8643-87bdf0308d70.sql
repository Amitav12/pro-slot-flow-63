-- Create booking_slots table for the Pro Slot Flow system
CREATE TABLE IF NOT EXISTS public.booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  service_id UUID NULL,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked')),
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_by UUID NULL,
  blocked_until TIMESTAMP WITH TIME ZONE NULL,
  held_by UUID NULL,
  hold_expires_at TIMESTAMP WITH TIME ZONE NULL,
  booking_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_slots_provider_date ON public.booking_slots(provider_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_held_by ON public.booking_slots(held_by);
CREATE INDEX IF NOT EXISTS idx_booking_slots_expires ON public.booking_slots(hold_expires_at);

-- Enable RLS
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_slots
CREATE POLICY "Anyone can view available slots" ON public.booking_slots
  FOR SELECT USING (status = 'available' OR held_by = auth.uid());

CREATE POLICY "Authenticated users can hold slots" ON public.booking_slots
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage all slots" ON public.booking_slots
  FOR ALL USING (true);

-- Create function to get available slots
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
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired holds first
  UPDATE public.booking_slots 
  SET status = 'available', held_by = NULL, hold_expires_at = NULL
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
    bs.created_at
  FROM public.booking_slots bs
  WHERE bs.provider_id = p_provider_id
    AND (p_service_id IS NULL OR bs.service_id = p_service_id)
    AND bs.slot_date = p_date
    AND bs.status IN ('available', 'held')
    AND bs.is_blocked = false
  ORDER BY bs.slot_time;
END;
$$;

-- Create function to hold a slot
CREATE OR REPLACE FUNCTION public.hold_slot(
  slot_id UUID,
  user_id UUID,
  hold_duration_minutes INTEGER DEFAULT 7
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_available BOOLEAN := FALSE;
BEGIN
  -- Check if slot is available and update it atomically
  UPDATE public.booking_slots 
  SET 
    status = 'held',
    held_by = user_id,
    hold_expires_at = NOW() + (hold_duration_minutes || ' minutes')::INTERVAL
  WHERE 
    id = slot_id 
    AND status = 'available'
    AND is_blocked = false;
  
  GET DIAGNOSTICS slot_available = FOUND;
  RETURN slot_available;
END;
$$;

-- Create function to confirm slot booking
CREATE OR REPLACE FUNCTION public.confirm_slot_booking(
  slot_id UUID,
  user_id UUID,
  booking_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.booking_slots 
  SET 
    status = 'booked',
    booking_id = booking_id,
    held_by = NULL,
    hold_expires_at = NULL
  WHERE 
    id = slot_id 
    AND held_by = user_id
    AND status = 'held';
  
  RETURN FOUND;
END;
$$;

-- Create function to generate provider slots
CREATE OR REPLACE FUNCTION public.generate_provider_slots(
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date DATE;
  time_slot RECORD;
  availability RECORD;
BEGIN
  -- Standard time slots
  FOR time_slot IN 
    SELECT 
      '07:00:00'::TIME as start_time, '09:00:00'::TIME as end_time, 'Morning (7-9 AM)' as slot_name
    UNION ALL
    SELECT '09:00:00'::TIME, '11:00:00'::TIME, 'Mid Morning (9-11 AM)'
    UNION ALL
    SELECT '11:00:00'::TIME, '13:00:00'::TIME, 'Afternoon (11 AM-1 PM)'
    UNION ALL
    SELECT '13:00:00'::TIME, '15:00:00'::TIME, 'Mid Afternoon (1-3 PM)'
    UNION ALL
    SELECT '15:00:00'::TIME, '17:00:00'::TIME, 'Evening (3-5 PM)'
  LOOP
    current_date := p_start_date;
    
    WHILE current_date <= p_end_date LOOP
      -- Check if provider is available on this day and time
      SELECT * INTO availability
      FROM public.provider_availability pa
      WHERE pa.provider_id = p_provider_id
        AND pa.day_of_week = EXTRACT(DOW FROM current_date)
        AND pa.is_available = true
        AND time_slot.start_time >= pa.start_time
        AND time_slot.end_time <= pa.end_time;
      
      -- If provider is available, create the slot
      IF FOUND THEN
        INSERT INTO public.booking_slots (
          provider_id,
          slot_date,
          slot_time,
          status
        )
        VALUES (
          p_provider_id,
          current_date,
          time_slot.start_time,
          'available'
        )
        ON CONFLICT (provider_id, slot_date, slot_time) DO NOTHING;
      END IF;
      
      current_date := current_date + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- Add unique constraint to prevent duplicate slots
ALTER TABLE public.booking_slots 
ADD CONSTRAINT unique_provider_date_time UNIQUE (provider_id, slot_date, slot_time);

-- Create trigger for updated_at
CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON public.booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();