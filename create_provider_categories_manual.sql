-- Manual SQL script to create provider_categories table
-- Execute this in Supabase Dashboard > SQL Editor

-- Create provider_categories table
CREATE TABLE IF NOT EXISTS public.provider_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_categories_provider_id ON public.provider_categories(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_categories_category_id ON public.provider_categories(category_id);

-- Enable RLS
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Providers can view and manage their own categories
CREATE POLICY "Providers can view own categories" ON public.provider_categories
    FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Providers can insert own categories" ON public.provider_categories
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own categories" ON public.provider_categories
    FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own categories" ON public.provider_categories
    FOR DELETE USING (auth.uid() = provider_id);

-- Admins can view all provider categories
CREATE POLICY "Admins can view all provider categories" ON public.provider_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Public can view approved provider categories (for customer browsing)
CREATE POLICY "Public can view approved provider categories" ON public.provider_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = provider_id 
            AND up.registration_status = 'approved'
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_provider_categories_updated_at
    BEFORE UPDATE ON public.provider_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create licenses storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for licenses bucket
CREATE POLICY "Providers can upload their own licenses" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'licenses' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Providers can view their own licenses" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'licenses' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all licenses" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'licenses' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );