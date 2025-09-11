-- Create orders table for booking management
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.user_profiles(id),
  service_id UUID REFERENCES public.provider_services(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'confirmed',
  service_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  special_instructions TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND auth_role = ANY(ARRAY['admin', 'super_admin'])
  )
);

-- Add media support to provider_services
ALTER TABLE public.provider_services 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- Add experience data to service_providers
ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]';

-- Add images to categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add images to subcategories  
ALTER TABLE public.subcategories
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();