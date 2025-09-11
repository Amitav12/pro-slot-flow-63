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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (provider_id, slot_date, slot_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_slots_provider_date ON public.booking_slots(provider_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_held_by ON public.booking_slots(held_by);
CREATE INDEX IF NOT EXISTS idx_booking_slots_expires ON public.booking_slots(hold_expires_at);

-- Enable RLS
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON public.booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();