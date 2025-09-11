-- Schema-only setup for customer dashboard
-- This only creates missing tables, columns, and policies - NO dummy data

-- 1. Create customer_favorites table if it doesn't exist
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

-- 2. Add missing columns to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS booking_date DATE,
ADD COLUMN IF NOT EXISTS booking_time TIME,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS provider_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 4. Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_favorites_customer_id ON public.customer_favorites(customer_id);

-- 6. Grant permissions
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.customer_favorites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Create RLS policies for bookings (only if they don't exist)
DO $$
BEGIN
    -- Bookings policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Users can view their own bookings'
    ) THEN
        CREATE POLICY "Users can view their own bookings" ON public.bookings
            FOR SELECT USING (auth.uid() = customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Users can insert their own bookings'
    ) THEN
        CREATE POLICY "Users can insert their own bookings" ON public.bookings
            FOR INSERT WITH CHECK (auth.uid() = customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Users can update their own bookings'
    ) THEN
        CREATE POLICY "Users can update their own bookings" ON public.bookings
            FOR UPDATE USING (auth.uid() = customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND policyname = 'Users can delete their own bookings'
    ) THEN
        CREATE POLICY "Users can delete their own bookings" ON public.bookings
            FOR DELETE USING (auth.uid() = customer_id);
    END IF;
    
    -- Customer favorites policies
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
        AND policyname = 'Users can update their own favorites'
    ) THEN
        CREATE POLICY "Users can update their own favorites" ON public.customer_favorites
            FOR UPDATE USING (auth.uid() = customer_id);
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

-- 8. Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for bookings updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Customer dashboard schema setup completed successfully!' as message;