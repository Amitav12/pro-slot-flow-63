-- Create function to generate booking slots for providers
CREATE OR REPLACE FUNCTION generate_provider_slots(
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS VOID AS $$
DECLARE
  curr_date DATE := p_start_date;
  current_slot_time TIME;
  availability_record RECORD;
BEGIN
  -- Loop through each date in the range
  WHILE curr_date <= p_end_date LOOP
    -- Check if provider has availability for this day
    SELECT * INTO availability_record
    FROM provider_availability 
    WHERE provider_availability.provider_id = p_provider_id 
      AND provider_availability.day_of_week = EXTRACT(dow FROM curr_date)
      AND provider_availability.is_available = true;
    
    -- If availability exists, generate slots
    IF FOUND THEN
      -- Generate 30-minute slots from start_time to end_time
      current_slot_time := availability_record.start_time;
      
      WHILE current_slot_time < availability_record.end_time LOOP
        -- Insert slot if it doesn't already exist
        INSERT INTO booking_slots (
          provider_id,
          slot_date,
          slot_time,
          status,
          is_blocked
        )
        VALUES (
          p_provider_id,
          curr_date,
          current_slot_time,
          'available',
          false
        )
        ON CONFLICT (provider_id, slot_date, slot_time) DO NOTHING;
        
        -- Move to next slot (30 minutes later)
        current_slot_time := current_slot_time + INTERVAL '30 minutes';
      END LOOP;
    END IF;
    
    -- Move to next date
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default availability for existing providers (9 AM to 5 PM, Monday to Friday)
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time, is_available, slot_duration)
SELECT 
  sp.id as provider_id,
  day_num as day_of_week,
  '09:00:00'::time as start_time,
  '17:00:00'::time as end_time,
  true as is_available,
  30 as slot_duration
FROM service_providers sp
CROSS JOIN generate_series(1, 5) as day_num  -- Monday to Friday
WHERE sp.status = 'approved'
ON CONFLICT (provider_id, day_of_week) DO NOTHING;

-- Generate slots for the next 30 days for all approved providers
DO $$
DECLARE
  provider_record RECORD;
  start_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + INTERVAL '30 days';
BEGIN
  FOR provider_record IN 
    SELECT id FROM service_providers WHERE status = 'approved'
  LOOP
    PERFORM generate_provider_slots(
      provider_record.id,
      start_date,
      end_date::DATE
    );
  END LOOP;
END $$;