-- Create payment_intents table to track payment intent details
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'requires_payment_method',
  client_secret TEXT,
  stripe_customer_id TEXT,
  cart_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_intents
CREATE POLICY "Users can view their own payment intents" 
ON public.payment_intents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment intents" 
ON public.payment_intents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage payment intents" 
ON public.payment_intents 
FOR ALL 
USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_intents_updated_at();

-- Update orders table to include cart_items and customer_info
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cart_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS customer_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';

-- Create index on payment_intent_id for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);