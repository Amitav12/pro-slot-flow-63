-- Create function to hold a slot
CREATE OR REPLACE FUNCTION public.hold_slot(
  slot_id UUID,
  user_id UUID,
  hold_duration_minutes INTEGER DEFAULT 7
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_affected INTEGER;
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
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
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
SET search_path = public
AS $$
DECLARE
  rows_affected INTEGER;
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
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
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
SET search_path = public
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