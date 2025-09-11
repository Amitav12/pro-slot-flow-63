-- Create cart_items table for authenticated users
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  provider_id TEXT,
  provider_name TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  service_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guest_cart_items table for non-authenticated users
CREATE TABLE IF NOT EXISTS public.guest_cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  provider_id TEXT,
  provider_name TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  service_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for cart_items (authenticated users)
CREATE POLICY IF NOT EXISTS "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for guest_cart_items (session-based)
CREATE POLICY IF NOT EXISTS "Anyone can view guest cart items" 
ON public.guest_cart_items 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can create guest cart items" 
ON public.guest_cart_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update guest cart items" 
ON public.guest_cart_items 
FOR UPDATE 
USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can delete guest cart items" 
ON public.guest_cart_items 
FOR DELETE 
USING (true);

-- Add updated_at trigger for cart_items
CREATE TRIGGER IF NOT EXISTS update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for guest_cart_items
CREATE TRIGGER IF NOT EXISTS update_guest_cart_items_updated_at
BEFORE UPDATE ON public.guest_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();