-- Create guest cart items table for anonymous users
CREATE TABLE public.guest_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  service_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  provider_id UUID,
  provider_name TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  service_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create authenticated user cart items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  provider_id UUID,
  provider_name TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  service_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.guest_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest cart (session-based)
CREATE POLICY "Users can manage their session cart items" ON public.guest_cart_items
FOR ALL USING (true);

-- RLS policies for authenticated user cart
CREATE POLICY "Users can manage their own cart items" ON public.cart_items
FOR ALL USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_guest_cart_items_updated_at
BEFORE UPDATE ON public.guest_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();