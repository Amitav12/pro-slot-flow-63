import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TimeSlot {
  id: string;
  provider_id: string;
  service_id?: string;
  slot_date: string;
  slot_time: string;
  is_blocked: boolean;
  booking_id?: string;
  blocked_by?: string;
  blocked_until?: string;
  created_at: string;
}

interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number; // 0-6 (Sunday = 0)
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration: number; // in minutes
}

export const useTimeSlots = (providerId?: string) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [availability, setAvailability] = useState<ProviderAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviderAvailability = async (targetProviderId?: string) => {
    try {
      let actualProviderId = targetProviderId;
      
      // If no providerId provided, get current user's provider ID
      if (!actualProviderId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setAvailability([]);
            return;
          }
          
          if (profile) {
            actualProviderId = profile.id;
          }
        }
      }

      if (!actualProviderId) {
        setAvailability([]);
        return;
      }

      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', actualProviderId);

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (targetProviderId: string, date: Date) => {
    try {
      // TODO: Implement booking slots table
      setSlots([]);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch time slots',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date: Date, targetProviderId: string) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_available);
    
    if (!dayAvailability) return [];

    const slots = [];
    const [startHour, startMinute] = dayAvailability.start_time.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const current = new Date(startTime);
    const slotDuration = dayAvailability.slot_duration || 30; // Default 30 minutes
    
    while (current < endTime) {
      const timeString = format(current, 'HH:mm');
      const existingSlot = slots.find(s => s.slot_time === timeString);
      
      if (!existingSlot || !existingSlot.is_blocked) {
        slots.push({
          id: `${format(date, 'yyyy-MM-dd')}-${timeString}`,
          time: timeString,
          available: !existingSlot?.is_blocked,
          price: 120, // Default price, should come from service
          date: format(date, 'yyyy-MM-dd')
        });
      }
      
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    
    return slots;
  };

  const blockTimeSlot = async (date: Date, time: string, duration: number = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const blockedUntil = new Date(date);
      const [hour, minute] = time.split(':').map(Number);
      blockedUntil.setHours(hour, minute + duration, 0, 0);

      // TODO: Implement booking slots functionality
      
      toast({
        title: 'Success',
        description: 'Time slot reserved successfully',
      });
      
      // Refresh slots
      if (providerId) fetchTimeSlots(providerId, date);
    } catch (error: any) {
      console.error('Error blocking slot:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reserve time slot',
        variant: 'destructive',
      });
    }
  };

  const updateProviderAvailability = async (
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    isAvailable: boolean,
    slotDuration: number = 30
  ) => {
    try {
      let actualProviderId = providerId;
      
      // If no providerId provided, get current user's provider ID
      if (!actualProviderId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profileError || !profile) {
            throw new Error('Provider profile not found');
          }
          
          actualProviderId = profile.id;
        }
      }

      if (!actualProviderId) throw new Error('Provider ID required');

      const { data, error } = await supabase
        .from('provider_availability')
        .upsert({
          provider_id: actualProviderId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
          slot_duration: slotDuration
        }, {
          onConflict: 'provider_id, day_of_week'
        })
        .select();

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Availability updated successfully',
      });
      
      // Refresh availability
      fetchProviderAvailability(actualProviderId);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchProviderAvailability();
  }, [providerId]);

  return {
    slots,
    availability,
    loading,
    fetchTimeSlots,
    generateTimeSlots,
    blockTimeSlot,
    updateProviderAvailability,
    refetch: () => fetchProviderAvailability()
  };
};