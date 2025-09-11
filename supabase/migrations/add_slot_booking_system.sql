-- Add status enum and hold functionality to existing booking_slots table
ALTER TABLE booking_slots 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked')),
ADD COLUMN IF NOT EXISTS held_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have 'available' status
UPDATE booking_slots SET status = 'available' WHERE status IS NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_hold_expires ON booking_slots(hold_expires_at) WHERE hold_expires_at IS NOT NULL;

-- Create function to hold a slot atomically
CREATE OR REPLACE FUNCTION hold_slot(
  slot_id UUID,
  user_id UUID,
  hold_duration_minutes INTEGER DEFAULT 7
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to update the slot if it's available
  UPDATE booking_slots 
  SET 
    status = 'held',
    held_by = user_id,
    hold_expires_at = NOW() + (hold_duration_minutes || ' minutes')::INTERVAL
  WHERE 
    id = slot_id 
    AND status = 'available';
  
  -- Return true if a row was updated (slot was successfully held)
  RETURN FOUND;
END;
$$;

-- Create function to confirm booking (convert held slot to booked)
CREATE OR REPLACE FUNCTION confirm_slot_booking(
  slot_id UUID,
  user_id UUID,
  booking_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update slot to booked status
  UPDATE booking_slots 
  SET 
    status = 'booked',
    booking_id = booking_id,
    hold_expires_at = NULL
  WHERE 
    id = slot_id 
    AND status = 'held'
    AND held_by = user_id
    AND hold_expires_at > NOW();
  
  RETURN FOUND;
END;
$$;

-- Create function to release expired holds
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  released_count INTEGER;
BEGIN
  -- Release all expired holds
  UPDATE booking_slots 
  SET 
    status = 'available',
    held_by = NULL,
    hold_expires_at = NULL
  WHERE 
    status = 'held' 
    AND hold_expires_at < NOW();
  
  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count;
END;
$$;

-- Create a scheduled job to clean up expired holds every minute
-- Note: This requires pg_cron extension to be enabled
SELECT cron.schedule('release-expired-holds', '* * * * *', 'SELECT release_expired_holds();');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION hold_slot TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_slot_booking TO authenticated;
GRANT EXECUTE ON FUNCTION release_expired_holds TO authenticated;