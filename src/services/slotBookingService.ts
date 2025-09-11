import { supabase } from '@/integrations/supabase/client';

// Define the BookingSlot interface locally to avoid type issues
interface BookingSlot {
  id: string;
  provider_id: string | null;
  service_id: string | null;
  slot_date: string;
  slot_time: string;
  status: 'available' | 'held' | 'booked';
  is_blocked: boolean;
  blocked_by: string | null;
  blocked_until: string | null;
  held_by: string | null;
  hold_expires_at: string | null;
  booking_id: string | null;
  created_at: string;
}

interface SlotBookingService {
  getAvailableSlots(providerId: string, serviceId: string, date: string): Promise<BookingSlot[]>;
  holdSlot(slotId: string, userId: string): Promise<boolean>;
  confirmSlotBooking(slotId: string, userId: string, bookingId: string): Promise<boolean>;
  releaseSlot(slotId: string, userId: string): Promise<boolean>;
}

class SlotBookingServiceImpl implements SlotBookingService {
  async getAvailableSlots(providerId: string, serviceId: string, date: string): Promise<BookingSlot[]> {
    try {
      // Use raw SQL query to avoid type issues
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_provider_id: providerId,
        p_service_id: serviceId,
        p_date: date
      }) as { data: BookingSlot[] | null; error: any };

      if (error) {
        console.error('Error fetching available slots:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      return [];
    }
  }

  async holdSlot(slotId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('hold_slot', {
        slot_id: slotId,
        user_id: userId,
        hold_duration_minutes: 7
      }) as { data: boolean | null; error: any };

      if (error) {
        console.error('Error holding slot:', error);
        throw error;
      }

      return data === true;
    } catch (error) {
      console.error('Error in holdSlot:', error);
      return false;
    }
  }

  async confirmSlotBooking(slotId: string, userId: string, bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('confirm_slot_booking', {
        slot_id: slotId,
        user_id: userId,
        booking_id: bookingId
      }) as { data: boolean | null; error: any };

      if (error) {
        console.error('Error confirming slot booking:', error);
        throw error;
      }

      return data === true;
    } catch (error) {
      console.error('Error in confirmSlotBooking:', error);
      return false;
    }
  }

  async releaseSlot(slotId: string, userId: string): Promise<boolean> {
    try {
      // Use raw SQL to release the slot
      const { data, error } = await supabase.rpc('release_slot', {
        slot_id: slotId,
        user_id: userId
      }) as { data: boolean | null; error: any };

      if (error) {
        console.error('Error releasing slot:', error);
        throw error;
      }

      return data === true;
    } catch (error) {
      console.error('Error in releaseSlot:', error);
      return false;
    }
  }
}

export const slotBookingService = new SlotBookingServiceImpl();
export type { BookingSlot };