-- Add proper address fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS nearby_address TEXT;

-- Update existing records to have proper address structure
UPDATE public.user_profiles 
SET country = COALESCE(country, 'United States')
WHERE country IS NULL;