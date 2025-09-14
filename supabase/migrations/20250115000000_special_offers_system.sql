-- Special Offers System Migration
-- This migration creates a production-ready special offers system with proper relationships

-- Create special_offers table
CREATE TABLE IF NOT EXISTS "public"."special_offers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "code" text NOT NULL UNIQUE,
    "discount_type" text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    "discount_value" numeric(10,2) NOT NULL CHECK (discount_value > 0),
    "minimum_order_amount" numeric(10,2) DEFAULT 0,
    "maximum_discount_amount" numeric(10,2),
    "usage_limit" integer,
    "usage_count" integer DEFAULT 0,
    "usage_limit_per_customer" integer DEFAULT 1,
    "valid_from" timestamp with time zone NOT NULL DEFAULT now(),
    "valid_until" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "applicable_services" jsonb DEFAULT '[]'::jsonb,
    "applicable_categories" jsonb DEFAULT '[]'::jsonb,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "created_by" uuid,
    CONSTRAINT "special_offers_pkey" PRIMARY KEY ("id")
);

-- Create coupons table (for individual coupon instances)
CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "offer_id" uuid NOT NULL,
    "customer_id" uuid,
    "booking_id" uuid,
    "code_used" text NOT NULL,
    "discount_applied" numeric(10,2) NOT NULL,
    "original_amount" numeric(10,2) NOT NULL,
    "final_amount" numeric(10,2) NOT NULL,
    "used_at" timestamp with time zone NOT NULL DEFAULT now(),
    "status" text DEFAULT 'used'::text CHECK (status IN ('used', 'refunded')),
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- Create platform_fees table
CREATE TABLE IF NOT EXISTS "public"."platform_fees" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "fee_type" text NOT NULL CHECK (fee_type IN ('percentage', 'fixed_amount')),
    "fee_value" numeric(10,2) NOT NULL CHECK (fee_value >= 0),
    "minimum_fee" numeric(10,2) DEFAULT 0,
    "maximum_fee" numeric(10,2),
    "applicable_services" jsonb DEFAULT '[]'::jsonb,
    "applicable_categories" jsonb DEFAULT '[]'::jsonb,
    "is_active" boolean DEFAULT true,
    "description" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "created_by" uuid,
    CONSTRAINT "platform_fees_pkey" PRIMARY KEY ("id")
);

-- Create tax_slabs table
CREATE TABLE IF NOT EXISTS "public"."tax_slabs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "tax_percentage" numeric(5,2) NOT NULL CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
    "minimum_amount" numeric(10,2) DEFAULT 0,
    "maximum_amount" numeric(10,2),
    "is_active" boolean DEFAULT true,
    "applies_to" text DEFAULT 'all' CHECK (applies_to IN ('all', 'services', 'bookings')),
    "description" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    "created_by" uuid,
    CONSTRAINT "tax_slabs_pkey" PRIMARY KEY ("id")
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" uuid,
    "provider_id" uuid,
    "service_id" uuid,
    "booking_date" date NOT NULL,
    "booking_time" time NOT NULL,
    "status" text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
    "total_amount" numeric(10,2) NOT NULL,
    "payment_status" text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    "payment_intent_id" text,
    "special_instructions" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- Create booking_discounts table (to track discounts applied to bookings)
CREATE TABLE IF NOT EXISTS "public"."booking_discounts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" uuid NOT NULL,
    "offer_id" uuid,
    "coupon_code" text,
    "discount_type" text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    "discount_value" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "booking_discounts_pkey" PRIMARY KEY ("id")
);

-- Create booking_fees table (to track platform fees applied to bookings)
CREATE TABLE IF NOT EXISTS "public"."booking_fees" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" uuid NOT NULL,
    "fee_type" text NOT NULL CHECK (fee_type IN ('percentage', 'fixed_amount')),
    "fee_value" numeric(10,2) NOT NULL,
    "fee_amount" numeric(10,2) NOT NULL,
    "description" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "booking_fees_pkey" PRIMARY KEY ("id")
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_special_offers_code" ON "public"."special_offers" USING btree ("code");
CREATE INDEX IF NOT EXISTS "idx_special_offers_active" ON "public"."special_offers" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_special_offers_valid_dates" ON "public"."special_offers" USING btree ("valid_from", "valid_until");
CREATE INDEX IF NOT EXISTS "idx_coupons_offer_id" ON "public"."coupons" USING btree ("offer_id");
CREATE INDEX IF NOT EXISTS "idx_coupons_customer_id" ON "public"."coupons" USING btree ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_coupons_booking_id" ON "public"."coupons" USING btree ("booking_id");
CREATE INDEX IF NOT EXISTS "idx_platform_fees_active" ON "public"."platform_fees" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_tax_slabs_active" ON "public"."tax_slabs" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_tax_slabs_amount_range" ON "public"."tax_slabs" USING btree ("minimum_amount", "maximum_amount");
CREATE INDEX IF NOT EXISTS "idx_booking_discounts_booking_id" ON "public"."booking_discounts" USING btree ("booking_id");
CREATE INDEX IF NOT EXISTS "idx_booking_fees_booking_id" ON "public"."booking_fees" USING btree ("booking_id");

-- Add foreign key constraints
ALTER TABLE "public"."coupons" 
ADD CONSTRAINT "coupons_offer_id_fkey" 
FOREIGN KEY ("offer_id") 
REFERENCES "public"."special_offers"("id") 
ON DELETE CASCADE;

ALTER TABLE "public"."coupons" 
ADD CONSTRAINT "coupons_customer_id_fkey" 
FOREIGN KEY ("customer_id") 
REFERENCES "auth"."users"("id") 
ON DELETE SET NULL;

ALTER TABLE "public"."coupons" 
ADD CONSTRAINT "coupons_booking_id_fkey" 
FOREIGN KEY ("booking_id") 
REFERENCES "public"."bookings"("id") 
ON DELETE SET NULL;

ALTER TABLE "public"."booking_discounts" 
ADD CONSTRAINT "booking_discounts_booking_id_fkey" 
FOREIGN KEY ("booking_id") 
REFERENCES "public"."bookings"("id") 
ON DELETE CASCADE;

ALTER TABLE "public"."booking_discounts" 
ADD CONSTRAINT "booking_discounts_offer_id_fkey" 
FOREIGN KEY ("offer_id") 
REFERENCES "public"."special_offers"("id") 
ON DELETE SET NULL;

ALTER TABLE "public"."booking_fees" 
ADD CONSTRAINT "booking_fees_booking_id_fkey" 
FOREIGN KEY ("booking_id") 
REFERENCES "public"."bookings"("id") 
ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE "public"."special_offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."platform_fees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tax_slabs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."booking_discounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."booking_fees" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Special offers policies
CREATE POLICY "Allow public read access to active special offers" ON "public"."special_offers"
FOR SELECT USING (is_active = true AND valid_from <= now() AND valid_until >= now());

CREATE POLICY "Allow admin full access to special offers" ON "public"."special_offers"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Coupons policies
CREATE POLICY "Allow users to view their own coupons" ON "public"."coupons"
FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Allow admin full access to coupons" ON "public"."coupons"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Platform fees policies
CREATE POLICY "Allow public read access to active platform fees" ON "public"."platform_fees"
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to platform fees" ON "public"."platform_fees"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Tax slabs policies
CREATE POLICY "Allow public read access to active tax slabs" ON "public"."tax_slabs"
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to tax slabs" ON "public"."tax_slabs"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Booking discounts policies
CREATE POLICY "Allow users to view discounts on their bookings" ON "public"."booking_discounts"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = booking_discounts.booking_id 
    AND bookings.customer_id = auth.uid()
  )
);

CREATE POLICY "Allow admin full access to booking discounts" ON "public"."booking_discounts"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Booking fees policies
CREATE POLICY "Allow users to view fees on their bookings" ON "public"."booking_fees"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = booking_fees.booking_id 
    AND bookings.customer_id = auth.uid()
  )
);

CREATE POLICY "Allow admin full access to booking fees" ON "public"."booking_fees"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Insert default platform fee
INSERT INTO "public"."platform_fees" (
  "fee_type",
  "fee_value",
  "minimum_fee",
  "maximum_fee",
  "description",
  "is_active"
) VALUES (
  'percentage',
  5.00,
  1.00,
  50.00,
  'Default platform service fee',
  true
) ON CONFLICT DO NOTHING;

-- Insert default tax slabs
INSERT INTO "public"."tax_slabs" (
  "name",
  "tax_percentage",
  "minimum_amount",
  "maximum_amount",
  "is_active",
  "applies_to",
  "description"
) VALUES 
(
  'Standard Tax',
  18.00,
  0.00,
  NULL,
  true,
  'all',
  'Standard GST rate for all services'
),
(
  'Reduced Tax',
  5.00,
  0.00,
  100.00,
  false,
  'services',
  'Reduced tax rate for services under $100'
),
(
  'Premium Tax',
  28.00,
  500.00,
  NULL,
  false,
  'services',
  'Premium tax rate for high-value services'
) ON CONFLICT DO NOTHING;

-- Insert sample special offers
INSERT INTO "public"."special_offers" (
  "title",
  "description",
  "code",
  "discount_type",
  "discount_value",
  "minimum_order_amount",
  "maximum_discount_amount",
  "usage_limit",
  "usage_limit_per_customer",
  "valid_from",
  "valid_until",
  "is_active"
) VALUES 
(
  'First Time Customer',
  'Get 20% off your first booking',
  'FIRST20',
  'percentage',
  20.00,
  50.00,
  100.00,
  1000,
  1,
  now(),
  now() + interval '1 year',
  true
),
(
  'Weekend Special',
  'Weekend bookings get extra savings',
  'WEEKEND15',
  'percentage',
  15.00,
  30.00,
  75.00,
  500,
  3,
  now(),
  now() + interval '6 months',
  true
),
(
  'Holiday Discount',
  'Fixed $25 off on holiday bookings',
  'HOLIDAY25',
  'fixed_amount',
  25.00,
  100.00,
  25.00,
  200,
  1,
  now(),
  now() + interval '3 months',
  true
) ON CONFLICT (code) DO NOTHING;

-- Create functions for coupon validation and application
CREATE OR REPLACE FUNCTION validate_coupon_code(coupon_code text, customer_id uuid, order_amount numeric)
RETURNS TABLE(
  is_valid boolean,
  offer_id uuid,
  discount_amount numeric,
  error_message text
) AS $$
DECLARE
  offer_record special_offers%ROWTYPE;
  usage_count_customer integer;
  calculated_discount numeric;
BEGIN
  -- Find the offer
  SELECT * INTO offer_record
  FROM special_offers
  WHERE code = coupon_code
    AND is_active = true
    AND valid_from <= now()
    AND valid_until >= now();
  
  -- Check if offer exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'Invalid or expired coupon code';
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF order_amount < offer_record.minimum_order_amount THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 
      format('Minimum order amount of $%.2f required', offer_record.minimum_order_amount);
    RETURN;
  END IF;
  
  -- Check usage limit
  IF offer_record.usage_limit IS NOT NULL AND offer_record.usage_count >= offer_record.usage_limit THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'Coupon usage limit exceeded';
    RETURN;
  END IF;
  
  -- Check per-customer usage limit
  SELECT COUNT(*) INTO usage_count_customer
  FROM coupons
  WHERE offer_id = offer_record.id AND customer_id = validate_coupon_code.customer_id;
  
  IF usage_count_customer >= offer_record.usage_limit_per_customer THEN
    RETURN QUERY SELECT false, null::uuid, 0::numeric, 'You have already used this coupon';
    RETURN;
  END IF;
  
  -- Calculate discount
  IF offer_record.discount_type = 'percentage' THEN
    calculated_discount := order_amount * (offer_record.discount_value / 100);
  ELSE
    calculated_discount := offer_record.discount_value;
  END IF;
  
  -- Apply maximum discount limit
  IF offer_record.maximum_discount_amount IS NOT NULL THEN
    calculated_discount := LEAST(calculated_discount, offer_record.maximum_discount_amount);
  END IF;
  
  RETURN QUERY SELECT true, offer_record.id, calculated_discount, null::text;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate platform fees
CREATE OR REPLACE FUNCTION calculate_platform_fees(order_amount numeric, service_ids uuid[] DEFAULT NULL)
RETURNS numeric AS $$
DECLARE
  fee_record platform_fees%ROWTYPE;
  calculated_fee numeric := 0;
BEGIN
  -- Get active platform fee (assuming one active fee at a time)
  SELECT * INTO fee_record
  FROM platform_fees
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate fee
  IF fee_record.fee_type = 'percentage' THEN
    calculated_fee := order_amount * (fee_record.fee_value / 100);
  ELSE
    calculated_fee := fee_record.fee_value;
  END IF;
  
  -- Apply minimum and maximum limits
  IF fee_record.minimum_fee IS NOT NULL THEN
    calculated_fee := GREATEST(calculated_fee, fee_record.minimum_fee);
  END IF;
  
  IF fee_record.maximum_fee IS NOT NULL THEN
    calculated_fee := LEAST(calculated_fee, fee_record.maximum_fee);
  END IF;
  
  RETURN calculated_fee;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usage count when coupon is used
CREATE OR REPLACE FUNCTION update_offer_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE special_offers
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = NEW.offer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offer_usage_count
  AFTER INSERT ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_offer_usage_count();

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_special_offers_updated_at
  BEFORE UPDATE ON special_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_platform_fees_updated_at
  BEFORE UPDATE ON platform_fees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();