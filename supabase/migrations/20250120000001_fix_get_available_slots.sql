-- Fix get_available_slots function to handle null service_id properly
CREATE OR REPLACE FUNCTION get_available_slots(
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
  blocked_until TIMESTAMPTZ,
  held_by UUID,
  hold_expires_at TIMESTAMPTZ,
  booking_id UUID,
  created_at TIMESTAMPTZ
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
  FROM booking_slots bs
  WHERE bs.provider_id = p_provider_id
    AND (p_service_id IS NULL OR bs.service_id = p_service_id)
    AND bs.slot_date = p_date
    AND (bs.status = 'available' OR (bs.status = 'held' AND bs.hold_expires_at < NOW()))
    AND bs.is_blocked = false
  ORDER BY bs.slot_time;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_available_slots TO authenticated;