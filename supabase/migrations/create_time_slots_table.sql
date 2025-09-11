-- Create time slots table for predefined slots
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert predefined time slots
INSERT INTO public.time_slots (slot_name, start_time, end_time, display_order) VALUES
('7:00 AM - 9:00 AM', '07:00:00', '09:00:00', 1),
('9:00 AM - 11:00 AM', '09:00:00', '11:00:00', 2),
('11:00 AM - 1:00 PM', '11:00:00', '13:00:00', 3),
('1:00 PM - 3:00 PM', '13:00:00', '15:00:00', 4),
('3:00 PM - 5:00 PM', '15:00:00', '17:00:00', 5)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE "public"."time_slots" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE "public"."time_slots" TO "anon";
GRANT ALL ON TABLE "public"."time_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."time_slots" TO "service_role";

-- Create RLS policy to allow read access
CREATE POLICY "Allow read access to time_slots" ON "public"."time_slots"
FOR SELECT USING (true);