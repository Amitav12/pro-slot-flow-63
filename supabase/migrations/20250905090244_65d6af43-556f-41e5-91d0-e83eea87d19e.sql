-- Add policy to allow public access to approved provider services
CREATE POLICY "Public can view approved provider services" ON public.provider_services
FOR SELECT 
USING (status = 'approved' AND is_active = true);