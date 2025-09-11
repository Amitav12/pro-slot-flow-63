-- Add sample data for customer dashboard testing
-- Run this in Supabase SQL Editor after logging in

-- First, let's check if the tables exist and create only what's missing
CREATE TABLE IF NOT EXISTS public.customer_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    category TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    price_range TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- Add missing columns to user_profiles if they don't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_favorites_customer_id ON public.customer_favorites(customer_id);

-- Grant permissions
GRANT ALL ON public.customer_favorites TO authenticated;

-- Create RLS policies for favorites (with IF NOT EXISTS equivalent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_favorites' 
        AND policyname = 'Users can view their own favorites'
    ) THEN
        CREATE POLICY "Users can view their own favorites" ON public.customer_favorites
            FOR SELECT USING (auth.uid() = customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_favorites' 
        AND policyname = 'Users can insert their own favorites'
    ) THEN
        CREATE POLICY "Users can insert their own favorites" ON public.customer_favorites
            FOR INSERT WITH CHECK (auth.uid() = customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_favorites' 
        AND policyname = 'Users can delete their own favorites'
    ) THEN
        CREATE POLICY "Users can delete their own favorites" ON public.customer_favorites
            FOR DELETE USING (auth.uid() = customer_id);
    END IF;
END
$$;

-- Clear any existing sample data for this user
DELETE FROM public.bookings WHERE customer_id = auth.uid() AND service_name IN ('House Cleaning Service', 'Car Wash Premium');
DELETE FROM public.customer_favorites WHERE customer_id = auth.uid() AND service_id IN ('service-premium-car-wash', 'service-home-cleaning');

-- Insert fresh sample data
INSERT INTO public.bookings (customer_id, service_name, provider_name, booking_date, booking_time, status, total_amount, location, provider_phone)
VALUES 
    (auth.uid(), 'House Cleaning Service', 'Clean Pro Services', CURRENT_DATE + INTERVAL '3 days', '10:00:00', 'confirmed', 150.00, 'New York, NY', '+1-555-0123'),
    (auth.uid(), 'Car Wash Premium', 'Auto Shine Pro', CURRENT_DATE - INTERVAL '5 days', '14:30:00', 'completed', 80.00, 'Downtown', '+1-555-0456'),
    (auth.uid(), 'Plumbing Repair', 'Fix-It Pros', CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'pending', 120.00, 'Uptown', '+1-555-0789');

INSERT INTO public.customer_favorites (customer_id, service_id, service_name, provider_name, category, rating, price_range, location)
VALUES 
    (auth.uid(), 'service-premium-car-wash', 'Premium Car Wash', 'Auto Shine Pro', 'Automotive', 4.8, '$50-$80', 'Downtown'),
    (auth.uid(), 'service-home-cleaning', 'Deep Home Cleaning', 'Clean Masters', 'Home Services', 4.9, '$100-$200', 'Uptown'),
    (auth.uid(), 'service-lawn-care', 'Professional Lawn Care', 'Green Thumb Services', 'Outdoor', 4.7, '$60-$100', 'Suburbs');

-- Success message
SELECT 'Sample data added successfully! Go to http://localhost:8080/dashboard to see your customer dashboard.' as message;