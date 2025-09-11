-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON public.payment_intents;
DROP FUNCTION IF EXISTS public.update_payment_intents_updated_at();

CREATE OR REPLACE FUNCTION public.update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_intents_updated_at();