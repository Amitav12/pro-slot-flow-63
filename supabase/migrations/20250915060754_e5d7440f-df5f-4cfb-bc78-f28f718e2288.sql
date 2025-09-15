-- Add missing columns to subcategories table
ALTER TABLE public.subcategories 
ADD COLUMN IF NOT EXISTS min_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_price NUMERIC DEFAULT 999999;

-- Add missing columns to user_profiles table  
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}';

-- Create provider_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, category_id)
);

-- Enable RLS for provider_categories
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provider_categories
CREATE POLICY "Public can view provider categories" ON public.provider_categories
  FOR SELECT USING (true);

CREATE POLICY "Providers can manage their own categories" ON public.provider_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.id = provider_categories.provider_id
    )
  );

CREATE POLICY "Admins can manage all provider categories" ON public.provider_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_provider_categories_updated_at
  BEFORE UPDATE ON public.provider_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();