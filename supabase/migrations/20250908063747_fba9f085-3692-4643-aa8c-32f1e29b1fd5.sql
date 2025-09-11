-- Create payment_intents table to track Stripe payments
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  client_secret TEXT,
  stripe_customer_id TEXT,
  cart_items JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_intents
CREATE POLICY "Users can view their own payment intents" 
ON public.payment_intents 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create payment intents" 
ON public.payment_intents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update payment intents" 
ON public.payment_intents 
FOR UPDATE 
USING (true);

-- Create orders table for completed bookings
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id TEXT REFERENCES public.payment_intents(id),
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  cart_items JSONB NOT NULL,
  customer_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);