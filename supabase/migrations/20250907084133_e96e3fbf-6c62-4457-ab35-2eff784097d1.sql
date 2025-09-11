-- Create provider availability table
CREATE TABLE IF NOT EXISTS public.provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  slot_duration INTEGER NOT NULL DEFAULT 30, -- Duration in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id, day_of_week)
);

-- Enable RLS on provider_availability
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_availability
CREATE POLICY "Providers can manage their own availability" ON public.provider_availability
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.id = provider_availability.provider_id
  )
);

CREATE POLICY "Anyone can view provider availability" ON public.provider_availability
FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON public.provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();