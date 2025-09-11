-- Add proper address fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS postal_code varchar(20),
ADD COLUMN IF NOT EXISTS state varchar(100),
ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'United States';

-- Update existing records with default country if null
UPDATE public.user_profiles 
SET country = 'United States' 
WHERE country IS NULL;