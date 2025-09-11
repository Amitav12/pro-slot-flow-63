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
  date: string;
  is_available: boolean;
  time_slots: string[];
}

interface BookingSlot {
  id: string;
  provider_id: string;
  service_id?: string;
  date: string;
  time_slot_id: string;
  status: 'available' | 'held' | 'booked' | 'blocked';
  time_slot: TimeSlot;
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

  // Set provider availability for a specific date
  const setProviderAvailability = async (
    providerId: string,
    date: string,
    isAvailable: boolean,
    selectedTimeSlots: string[] = []
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: providerId,
          date,
          is_available: isAvailable,
          time_slots: selectedTimeSlots
        });

      if (error) throw error;

      // Generate or remove booking slots based on availability
      if (isAvailable) {
        await supabase.rpc('generate_provider_slots', {
          p_provider_id: providerId,
          p_start_date: date,
          p_end_date: date
        });
      } else {
        // Remove booking slots for this date
        await supabase
          .from('booking_slots')
          .delete()
          .eq('provider_id', providerId)
          .eq('date', date)
          .eq('status', 'available');
      }

      toast({
        title: "Success",
        description: `Availability ${isAvailable ? 'set' : 'removed'} for ${date}`
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
      const { data, error } = await supabase
        .from('booking_slots')
        .select(`
          *,
          time_slot:time_slots(*)
        `)
        .eq('provider_id', providerId)
        .eq('date', date)
        .eq('status', 'available')
        .order('time_slot.display_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  };

  // Hold a slot temporarily (7 minutes)
  const holdSlot = async (slotId: string, userId: string) => {
    try {
      const holdExpiresAt = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
      
      const { error } = await supabase
        .from('booking_slots')
        .update({
          status: 'held',
          held_by: userId,
          hold_expires_at: holdExpiresAt.toISOString()
        })
        .eq('id', slotId)
        .eq('status', 'available');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error holding slot:', error);
      return false;
    }
  };

  // Release a held slot
  const releaseSlot = async (slotId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('booking_slots')
        .update({
          status: 'available',
          held_by: null,
          hold_expires_at: null
        })
        .eq('id', slotId)
        .eq('held_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error releasing slot:', error);
      return false;
    }
  };

  // Get provider availability for a date range
  const getProviderAvailability = async (
    providerId: string,
    startDate: string,
    endDate: string
  ): Promise<ProviderAvailability[]> => {
    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching provider availability:', error);
      return [];
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
    fetchTimeSlots
  };
};