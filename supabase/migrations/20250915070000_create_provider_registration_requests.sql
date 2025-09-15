-- Create provider_registration_requests table
CREATE TABLE IF NOT EXISTS public.provider_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_document_url TEXT,
  id_document_url TEXT,
  business_registration_url TEXT,
  experience_years INTEGER DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.provider_registration_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Providers can view their own requests
CREATE POLICY "Providers can view own registration requests" ON public.provider_registration_requests
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Providers can create their own requests
CREATE POLICY "Providers can create registration requests" ON public.provider_registration_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Providers can update their own pending requests
CREATE POLICY "Providers can update own pending requests" ON public.provider_registration_requests
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Admins and Super Admins can view all requests
CREATE POLICY "Admins can view all registration requests" ON public.provider_registration_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Admins and Super Admins can update requests (approve/reject)
CREATE POLICY "Admins can update registration requests" ON public.provider_registration_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.auth_role IN ('admin', 'super_admin')
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_registration_requests_updated_at
  BEFORE UPDATE ON public.provider_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_registration_requests_user_id ON public.provider_registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_registration_requests_category_id ON public.provider_registration_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_registration_requests_status ON public.provider_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_provider_registration_requests_created_at ON public.provider_registration_requests(created_at DESC);

-- Create function to automatically create admin notification when new request is submitted
CREATE OR REPLACE FUNCTION public.notify_admin_new_provider_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for admins
  INSERT INTO public.admin_notifications (
    type,
    title,
    message,
    data,
    created_by
  ) VALUES (
    'provider_registration',
    'New Provider Registration Request',
    'A new service provider has submitted a registration request for ' || 
    (SELECT name FROM public.categories WHERE id = NEW.category_id),
    jsonb_build_object(
      'request_id', NEW.id,
      'business_name', NEW.business_name,
      'category_id', NEW.category_id,
      'contact_person', NEW.contact_person
    ),
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify admins of new requests
CREATE TRIGGER trigger_notify_admin_new_provider_request
  AFTER INSERT ON public.provider_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_provider_request();

-- Create function to update user profile when request is approved
CREATE OR REPLACE FUNCTION public.handle_provider_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to approved
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    -- Update user profile to provider role and approved status
    UPDATE public.user_profiles 
    SET 
      role = 'provider',
      auth_role = 'provider',
      registration_status = 'approved',
      business_name = NEW.business_name,
      contact_person = NEW.contact_person,
      phone = NEW.phone,
      address = NEW.address,
      license_number = NEW.license_number,
      license_document_url = NEW.license_document_url,
      id_document_url = NEW.id_document_url,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Create provider_services entry for the approved category
    INSERT INTO public.provider_services (
      provider_id,
      category_id,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.user_id,
      NEW.category_id,
      true,
      NOW(),
      NOW()
    ) ON CONFLICT (provider_id, category_id) DO NOTHING;
    
    -- Set approval timestamp and approver
    NEW.approved_at = NOW();
    NEW.approved_by = auth.uid();
    
  -- If status changed to rejected
  ELSIF OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
    -- Set rejection timestamp and rejector
    NEW.rejected_at = NOW();
    NEW.rejected_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle approval/rejection
CREATE TRIGGER trigger_handle_provider_request_approval
  BEFORE UPDATE ON public.provider_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_provider_request_approval();

-- Add comments for documentation
COMMENT ON TABLE public.provider_registration_requests IS 'Stores provider registration requests for admin approval';
COMMENT ON COLUMN public.provider_registration_requests.status IS 'Request status: pending, approved, rejected';
COMMENT ON COLUMN public.provider_registration_requests.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN public.provider_registration_requests.experience_years IS 'Years of experience in the field';