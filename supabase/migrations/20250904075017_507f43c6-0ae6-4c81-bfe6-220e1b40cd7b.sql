-- Add missing min_price and max_price columns to subcategories table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subcategories' AND column_name = 'min_price') THEN
        ALTER TABLE public.subcategories ADD COLUMN min_price numeric NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subcategories' AND column_name = 'max_price') THEN
        ALTER TABLE public.subcategories ADD COLUMN max_price numeric NOT NULL DEFAULT 999999;
    END IF;
END $$;

-- Create locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    address text NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    postal_code character varying NOT NULL,
    country character varying NOT NULL DEFAULT 'United States',
    latitude numeric,
    longitude numeric,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
DROP POLICY IF EXISTS "Allow all operations on locations" ON public.locations;
CREATE POLICY "Allow all operations on locations" 
ON public.locations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create customer_favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_favorites (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid,
    service_id text NOT NULL,
    service_name text NOT NULL,
    provider_name text NOT NULL,
    category text,
    rating numeric DEFAULT 0,
    price_range text,
    location text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on customer_favorites
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.customer_favorites;
CREATE POLICY "Users can view their own favorites" 
ON public.customer_favorites 
FOR SELECT 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.customer_favorites;
CREATE POLICY "Users can insert their own favorites" 
ON public.customer_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can update their own favorites" ON public.customer_favorites;
CREATE POLICY "Users can update their own favorites" 
ON public.customer_favorites 
FOR UPDATE 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.customer_favorites;
CREATE POLICY "Users can delete their own favorites" 
ON public.customer_favorites 
FOR DELETE 
USING (auth.uid() = customer_id);

-- Create promote_user_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.promote_user_role(user_uuid uuid, new_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Update user role
    UPDATE public.user_profiles 
    SET role = new_role, auth_role = new_role, updated_at = now()
    WHERE user_id = user_uuid;
    
    -- Return success result
    SELECT jsonb_build_object('success', true, 'message', 'User role updated successfully') INTO result;
    
    RETURN result;
END;
$$;