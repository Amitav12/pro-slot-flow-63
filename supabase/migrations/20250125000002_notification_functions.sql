-- Additional database functions and triggers for notification system
-- This migration adds helper functions for the notification scheduler

-- Function to check if a provider needs an availability reminder
CREATE OR REPLACE FUNCTION check_provider_needs_reminder(
  p_provider_id UUID,
  p_days_advance INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_future_date DATE;
  v_has_availability BOOLEAN;
  v_last_reminder_date DATE;
  v_reminder_enabled BOOLEAN;
BEGIN
  -- Calculate the future date to check
  v_future_date := CURRENT_DATE + INTERVAL '1 day' * p_days_advance;
  
  -- Check if reminders are enabled for this provider
  SELECT availability_reminder_enabled 
  INTO v_reminder_enabled
  FROM provider_notification_preferences 
  WHERE provider_id = p_provider_id;
  
  -- If no preferences found or reminders disabled, return false
  IF v_reminder_enabled IS NULL OR v_reminder_enabled = FALSE THEN
    RETURN FALSE;
  END IF;
  
  -- Check if provider has availability set for the future date range
  SELECT EXISTS(
    SELECT 1 
    FROM provider_weekly_availability 
    WHERE provider_id = p_provider_id 
    AND week_start >= v_future_date
    AND week_start <= v_future_date + INTERVAL '4 weeks'
  ) INTO v_has_availability;
  
  -- If they have availability, no reminder needed
  IF v_has_availability THEN
    RETURN FALSE;
  END IF;
  
  -- Check when the last reminder was sent
  SELECT MAX(sent_at::DATE) 
  INTO v_last_reminder_date
  FROM provider_availability_notifications 
  WHERE provider_id = p_provider_id 
  AND notification_type = 'availability_reminder'
  AND status = 'sent';
  
  -- If no reminder was sent before, or last reminder was more than 7 days ago
  IF v_last_reminder_date IS NULL OR v_last_reminder_date < CURRENT_DATE - INTERVAL '7 days' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to get provider contact information for notifications
CREATE OR REPLACE FUNCTION get_provider_contact_info(
  p_provider_id UUID
)
RETURNS TABLE(
  provider_id UUID,
  provider_name TEXT,
  email TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as provider_id,
    COALESCE(p.full_name, p.email) as provider_name,
    p.email,
    p.phone
  FROM auth.users p
  WHERE p.id = p_provider_id;
END;
$$;

-- Function to create weekly availability slots from template
CREATE OR REPLACE FUNCTION create_weekly_slots_from_template(
  p_provider_id UUID,
  p_week_start DATE,
  p_template_data JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_data JSONB;
  v_day_name TEXT;
  v_day_date DATE;
  v_slot_data JSONB;
  v_slots_created INTEGER := 0;
BEGIN
  -- Loop through each day in the template
  FOR v_day_name, v_day_data IN SELECT * FROM jsonb_each(p_template_data)
  LOOP
    -- Calculate the date for this day of the week
    v_day_date := p_week_start + 
      CASE v_day_name
        WHEN 'monday' THEN 0
        WHEN 'tuesday' THEN 1
        WHEN 'wednesday' THEN 2
        WHEN 'thursday' THEN 3
        WHEN 'friday' THEN 4
        WHEN 'saturday' THEN 5
        WHEN 'sunday' THEN 6
        ELSE 0
      END;
    
    -- Skip if day is not available
    IF NOT (v_day_data->>'available')::BOOLEAN THEN
      CONTINUE;
    END IF;
    
    -- Create slots for this day
    FOR v_slot_data IN SELECT * FROM jsonb_array_elements(v_day_data->'slots')
    LOOP
      INSERT INTO provider_availability (
        provider_id,
        day_of_week,
        start_time,
        end_time,
        slot_duration,
        is_available
      ) VALUES (
        p_provider_id,
        EXTRACT(DOW FROM v_day_date)::INTEGER,
        (v_slot_data->>'start_time')::TIME,
        (v_slot_data->>'end_time')::TIME,
        COALESCE((v_slot_data->>'duration')::INTEGER, 30),
        TRUE
      )
      ON CONFLICT (provider_id, day_of_week, start_time) 
      DO UPDATE SET
        end_time = EXCLUDED.end_time,
        slot_duration = EXCLUDED.slot_duration,
        is_available = EXCLUDED.is_available,
        updated_at = NOW();
      
      v_slots_created := v_slots_created + 1;
    END LOOP;
  END LOOP;
  
  RETURN v_slots_created;
END;
$$;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM provider_availability_notifications
  WHERE sent_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Function to get availability statistics for a provider
CREATE OR REPLACE FUNCTION get_provider_availability_stats(
  p_provider_id UUID,
  p_weeks_ahead INTEGER DEFAULT 4
)
RETURNS TABLE(
  total_weeks INTEGER,
  weeks_with_availability INTEGER,
  coverage_percentage NUMERIC,
  next_missing_week DATE,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  v_start_date := CURRENT_DATE;
  v_end_date := v_start_date + INTERVAL '1 week' * p_weeks_ahead;
  
  RETURN QUERY
  WITH week_series AS (
    SELECT generate_series(
      date_trunc('week', v_start_date)::DATE,
      date_trunc('week', v_end_date)::DATE,
      INTERVAL '1 week'
    )::DATE as week_start
  ),
  availability_coverage AS (
    SELECT 
      ws.week_start,
      CASE WHEN pwa.week_start IS NOT NULL THEN 1 ELSE 0 END as has_availability
    FROM week_series ws
    LEFT JOIN provider_weekly_availability pwa 
      ON pwa.provider_id = p_provider_id 
      AND pwa.week_start = ws.week_start
  )
  SELECT 
    p_weeks_ahead as total_weeks,
    SUM(ac.has_availability)::INTEGER as weeks_with_availability,
    ROUND((SUM(ac.has_availability)::NUMERIC / p_weeks_ahead) * 100, 2) as coverage_percentage,
    (
      SELECT MIN(week_start) 
      FROM availability_coverage 
      WHERE has_availability = 0
    ) as next_missing_week,
    (
      SELECT MAX(updated_at) 
      FROM provider_weekly_availability 
      WHERE provider_id = p_provider_id
    ) as last_updated
  FROM availability_coverage ac;
END;
$$;

-- Trigger function to automatically create notification preferences for new providers
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create preferences for users with provider role
  IF NEW.raw_user_meta_data->>'role' = 'provider' THEN
    INSERT INTO provider_notification_preferences (
      provider_id,
      availability_reminder_enabled,
      reminder_days_advance,
      notification_time,
      email_notifications,
      sms_notifications
    ) VALUES (
      NEW.id,
      TRUE,
      15,
      '09:00:00',
      TRUE,
      FALSE
    )
    ON CONFLICT (provider_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Function to send notification batch (to be called by external scheduler)
CREATE OR REPLACE FUNCTION process_notification_batch(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE(
  provider_id UUID,
  provider_name TEXT,
  email TEXT,
  week_start DATE,
  notification_sent BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider RECORD;
  v_notification_id UUID;
BEGIN
  -- Get providers needing reminders (limited batch)
  FOR v_provider IN 
    SELECT * FROM get_providers_needing_availability_reminder()
    LIMIT p_batch_size
  LOOP
    BEGIN
      -- Create notification record
      INSERT INTO provider_availability_notifications (
        provider_id,
        notification_type,
        week_start,
        status,
        message
      ) VALUES (
        v_provider.provider_id,
        'availability_reminder',
        v_provider.week_start::DATE,
        'pending',
        'Reminder to set availability for week starting ' || v_provider.week_start
      ) RETURNING id INTO v_notification_id;
      
      -- Return success record
      provider_id := v_provider.provider_id;
      provider_name := v_provider.provider_name;
      email := v_provider.email;
      week_start := v_provider.week_start::DATE;
      notification_sent := TRUE;
      error_message := NULL;
      
      RETURN NEXT;
      
      -- Update notification status to sent
      UPDATE provider_availability_notifications 
      SET status = 'sent', sent_at = NOW()
      WHERE id = v_notification_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Return error record
      provider_id := v_provider.provider_id;
      provider_name := v_provider.provider_name;
      email := v_provider.email;
      week_start := v_provider.week_start::DATE;
      notification_sent := FALSE;
      error_message := SQLERRM;
      
      RETURN NEXT;
      
      -- Update notification status to failed
      UPDATE provider_availability_notifications 
      SET status = 'failed', sent_at = NOW(), error_message = SQLERRM
      WHERE id = v_notification_id;
    END;
  END LOOP;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_weekly_availability_week_start 
  ON provider_weekly_availability(week_start);

CREATE INDEX IF NOT EXISTS idx_provider_availability_notifications_provider_type 
  ON provider_availability_notifications(provider_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_provider_availability_notifications_sent_at 
  ON provider_availability_notifications(sent_at);

CREATE INDEX IF NOT EXISTS idx_provider_notification_preferences_reminder_enabled 
  ON provider_notification_preferences(availability_reminder_enabled) 
  WHERE availability_reminder_enabled = TRUE;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_provider_needs_reminder(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_contact_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_weekly_slots_from_template(UUID, DATE, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_availability_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION process_notification_batch(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications(INTEGER) TO service_role;

-- Add helpful comments
COMMENT ON FUNCTION check_provider_needs_reminder IS 'Checks if a provider needs an availability reminder based on their preferences and current schedule';
COMMENT ON FUNCTION get_provider_contact_info IS 'Retrieves provider contact information for sending notifications';
COMMENT ON FUNCTION create_weekly_slots_from_template IS 'Creates weekly availability slots from a JSON template';
COMMENT ON FUNCTION get_provider_availability_stats IS 'Returns availability statistics for a provider over a specified period';
COMMENT ON FUNCTION process_notification_batch IS 'Processes a batch of notifications for the scheduler';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes old notification records to keep the database clean';