-- Fix RLS policies for provider registration system
-- This addresses the 403 error when submitting provider registration requests

-- First, let's check if the admin_notifications table exists and has the right policies
-- Drop existing restrictive policies for admin_notifications
DROP POLICY IF EXISTS "Only admins can create notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Only admins can view notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Only admins can update notifications" ON public.admin_notifications;

-- Create new policies that allow system functions to create notifications
-- Allow system functions (triggers) to create notifications
CREATE POLICY "System can create admin notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

-- Allow admins and super admins to view notifications
CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Allow admins and super admins to update notifications (mark as read, etc.)
CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Also ensure provider_registration_requests table has correct policies
-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Providers can create registration requests" ON public.provider_registration_requests;
DROP POLICY IF EXISTS "Providers can view own registration requests" ON public.provider_registration_requests;
DROP POLICY IF EXISTS "Providers can update own pending requests" ON public.provider_registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON public.provider_registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON public.provider_registration_requests;

-- Recreate provider_registration_requests policies
-- Allow authenticated users to create their own registration requests
CREATE POLICY "Users can create registration requests" ON public.provider_registration_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to view their own registration requests
CREATE POLICY "Users can view own registration requests" ON public.provider_registration_requests
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Allow users to update their own pending requests
CREATE POLICY "Users can update own pending requests" ON public.provider_registration_requests
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Allow admins and super admins to view all registration requests
CREATE POLICY "Admins can view all registration requests" ON public.provider_registration_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Allow admins and super admins to update registration requests (approve/reject)
CREATE POLICY "Admins can update registration requests" ON public.provider_registration_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Ensure the documents storage bucket has proper policies
-- Check if policies exist for documents bucket and create if needed
DO $$
BEGIN
  -- Create policy for users to upload their own documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload registration documents'
  ) THEN
    CREATE POLICY "Users can upload registration documents" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Create policy for users to view their own documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view own registration documents'
  ) THEN
    CREATE POLICY "Users can view own registration documents" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Create policy for admins to view all documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can view all registration documents'
  ) THEN
    CREATE POLICY "Admins can view all registration documents" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'documents' AND 
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_profiles.user_id = auth.uid() 
          AND user_profiles.auth_role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Success message
SELECT 'Provider registration RLS policies fixed successfully!' as message;