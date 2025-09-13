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
SET search_path = public
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