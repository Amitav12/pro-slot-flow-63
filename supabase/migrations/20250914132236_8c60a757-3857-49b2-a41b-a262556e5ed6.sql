-- Create provider_notification_preferences table
CREATE TABLE IF NOT EXISTS public.provider_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  availability_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_days_advance INTEGER NOT NULL DEFAULT 7,
  notification_methods JSONB NOT NULL DEFAULT '["email"]'::jsonb,
  week_start_day INTEGER NOT NULL DEFAULT 1, -- Monday
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id)
);

-- Enable RLS
ALTER TABLE public.provider_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can manage their own notification preferences"
ON public.provider_notification_preferences
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND user_profiles.id = provider_notification_preferences.provider_id
));

CREATE POLICY "Admins can view all notification preferences"
ON public.provider_notification_preferences
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND user_profiles.auth_role = ANY(ARRAY['admin', 'super_admin'])
));

-- Create provider_availability_notifications table for logging
CREATE TABLE IF NOT EXISTS public.provider_availability_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'availability_reminder',
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_availability_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can view their own notifications"
ON public.provider_availability_notifications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND user_profiles.id = provider_availability_notifications.provider_id
));

CREATE POLICY "System can insert notifications"
ON public.provider_availability_notifications
FOR INSERT
WITH CHECK (true);

-- Create provider_weekly_availability table for scheduling
CREATE TABLE IF NOT EXISTS public.provider_weekly_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  availability_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, week_start)
);

-- Enable RLS
ALTER TABLE public.provider_weekly_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can manage their own weekly availability"
ON public.provider_weekly_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND user_profiles.id = provider_weekly_availability.provider_id
));

CREATE POLICY "Public can view confirmed weekly availability"
ON public.provider_weekly_availability
FOR SELECT
USING (is_confirmed = true);

-- Create function to get providers needing availability reminders
CREATE OR REPLACE FUNCTION public.get_providers_needing_availability_reminder()
RETURNS TABLE(
  provider_id UUID,
  provider_name TEXT,
  email TEXT,
  phone TEXT,
  week_start TEXT,
  reminder_days_advance INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id as provider_id,
    COALESCE(up.full_name, '')::TEXT as provider_name,
    COALESCE(au.email, '')::TEXT as email,
    COALESCE(up.phone, '')::TEXT as phone,
    (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::interval)::date::TEXT as week_start,
    pnp.reminder_days_advance
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  JOIN public.provider_notification_preferences pnp ON pnp.provider_id = up.id
  WHERE up.role = 'provider' 
    AND up.registration_status = 'approved'
    AND pnp.availability_reminder_enabled = true
    AND NOT EXISTS (
      SELECT 1 FROM public.provider_weekly_availability pwa
      WHERE pwa.provider_id = up.id
        AND pwa.week_start = (CURRENT_DATE + (pnp.reminder_days_advance || ' days')::interval)::date
        AND pwa.is_confirmed = true
    );
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_provider_notification_preferences_updated_at
  BEFORE UPDATE ON public.provider_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_weekly_availability_updated_at
  BEFORE UPDATE ON public.provider_weekly_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();