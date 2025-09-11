-- Create customer dashboard tables
-- This script creates all necessary tables for the customer dashboard functionality

-- 1. Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID,
    service_name TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    location TEXT,
    provider_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer favorites table
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

-- 3. Update user_profiles table to include customer-specific fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_favorites_customer_id ON public.customer_favorites(customer_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = customer_id);

-- 7. Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" ON public.customer_favorites
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own favorites" ON public.customer_favorites
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own favorites" ON public.customer_favorites
    FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own favorites" ON public.customer_favorites
    FOR DELETE USING (auth.uid() = customer_id);

-- 8. Insert sample data for testing (optional)
-- This will only insert if the user exists and has no bookings yet
INSERT INTO public.bookings (customer_id, service_name, provider_name, booking_date, booking_time, status, total_amount, location, provider_phone)
SELECT 
    auth.uid(),
    'House Cleaning Service',
    'Clean Pro Services',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    'confirmed',
    150.00,
    'New York, NY',
    '+1-555-0123'
WHERE auth.uid() IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE customer_id = auth.uid());

INSERT INTO public.bookings (customer_id, service_name, provider_name, booking_date, booking_time, status, total_amount, location, provider_phone)
SELECT 
    auth.uid(),
    'Car Wash Premium',
    'Auto Shine Pro',
    CURRENT_DATE - INTERVAL '5 days',
    '14:30:00',
    'completed',
    80.00,
    'Downtown',
    '+1-555-0456'
WHERE auth.uid() IS NOT NULL 
AND (SELECT COUNT(*) FROM public.bookings WHERE customer_id = auth.uid()) < 2;

INSERT INTO public.customer_favorites (customer_id, service_id, service_name, provider_name, category, rating, price_range, location)
SELECT 
    auth.uid(),
    'service-premium-car-wash',
    'Premium Car Wash',
    'Auto Shine Pro',
    'Automotive',
    4.8,
    '$50-$80',
    'Downtown'
WHERE auth.uid() IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM public.customer_favorites WHERE customer_id = auth.uid());

INSERT INTO public.customer_favorites (customer_id, service_id, service_name, provider_name, category, rating, price_range, location)
SELECT 
    auth.uid(),
    'service-home-cleaning',
    'Deep Home Cleaning',
    'Clean Masters',
    'Home Services',
    4.9,
    '$100-$200',
    'Uptown'
WHERE auth.uid() IS NOT NULL 
AND (SELECT COUNT(*) FROM public.customer_favorites WHERE customer_id = auth.uid()) < 2;

-- 9. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Grant necessary permissions
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.customer_favorites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Customer dashboard tables created successfully!' as message;