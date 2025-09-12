import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  display_order: number;
}

interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration: number;
}

interface BookingSlot {
  id: string;
  provider_id: string;
  service_id?: string;
  slot_date: string;
  slot_time: string;
  status: string;
  is_blocked: boolean;
  held_by?: string;
  hold_expires_at?: string;
  booking_id?: string;
  blocked_by?: string;
  blocked_until?: string;
  created_at: string;
}

export const useProviderAvailability = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all time slots
  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch time slots",
        variant: "destructive"
      });
    }
  };

  // Set provider availability for a specific day of week
  const setProviderAvailability = async (
    providerId: string,
    dayOfWeek: number,
    isAvailable: boolean,
    startTime: string = '09:00:00',
    endTime: string = '17:00:00'
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: providerId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
          slot_duration: 120
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Availability ${isAvailable ? 'set' : 'removed'} for selected day`
      });
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get available slots for a provider on a specific date
  const getAvailableSlots = async (providerId: string, date: string): Promise<BookingSlot[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_provider_id: providerId,
        p_service_id: null,
        p_date: date
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  };

  // Hold a slot temporarily using the database function
  const holdSlot = async (slotId: string, userId: string) => {
    try {
      const { data, error } = await supabase.rpc('hold_slot', {
        slot_id: slotId,
        user_id: userId,
        hold_duration_minutes: 7
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error holding slot:', error);
      return false;
    }
  };

  // Release a held slot using the database function
  const releaseSlot = async (slotId: string, userId: string) => {
    try {
      const { data, error } = await supabase.rpc('release_slot', {
        slot_id: slotId,
        user_id: userId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error releasing slot:', error);
      return false;
    }
  };

  // Get provider availability for day of week
  const getProviderAvailability = async (
    providerId: string
  ): Promise<ProviderAvailability[]> => {
    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .order('day_of_week');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching provider availability:', error);
      return [];
    }
  };

  // Confirm a slot booking using the database function
  const confirmSlotBooking = async (slotId: string, userId: string, bookingId: string) => {
    try {
      const { data, error } = await supabase.rpc('confirm_slot_booking', {
        slot_id: slotId,
        user_id: userId,
        booking_id: bookingId
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error confirming slot booking:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  return {
    timeSlots,
    loading,
    setProviderAvailability,
    getAvailableSlots,
    holdSlot,
    releaseSlot,
    getProviderAvailability,
    confirmSlotBooking,
    fetchTimeSlots
  };
};