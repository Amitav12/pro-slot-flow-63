import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProviderAvailability } from '../hooks/useProviderAvailability';
import { SlotCountdownTimer } from '@/components/SlotCountdownTimer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, User, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const TimeSelection = () => {
  const { providerId, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getAvailableSlots, holdSlot, releaseSlot } = useProviderAvailability();
  
  // Get data from DateSelection page
  const { selectedServices = [], selectedProvider, selectedDate, category = '' } = location.state || {};
  
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [heldSlot, setHeldSlot] = useState<BookingSlot | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available slots when component mounts
  useEffect(() => {
    if (selectedDate && providerId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, providerId]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !providerId) return;
    
    setLoading(true);
    try {
      // Convert selectedDate to string format (YYYY-MM-DD)
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // First, try to get existing available slots
      const slots = await getAvailableSlots(providerId, dateString);
      
      // If no slots exist, generate them for this provider
      if (slots.length === 0) {
        // Generate slots for the next 15 days starting from selected date
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 14);
        
        // TODO: Re-enable slot generation when function is available
        // p_provider_id: providerId,
        // p_start_date: dateString,
        // p_end_date: endDate.toISOString().split('T')[0]
        // });
        
        // if (error) {
        //   console.error('Error generating slots:', error);
        //   toast({
        //     title: "Error",
        //     description: "Failed to generate time slots",
        //     variant: "destructive"
        //   });
        //   return;
        // }
        
        // Fetch the newly generated slots
        const newSlots = await getAvailableSlots(providerId, dateString);
        setAvailableSlots(newSlots);
      } else {
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = async (slot: BookingSlot) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a slot",
        variant: "destructive"
      });
      return;
    }

    // Release previously held slot if any
    if (heldSlot && heldSlot.id !== slot.id) {
      await releaseSlot(heldSlot.id, user.id);
    }

    // Hold the new slot
    const success = await holdSlot(slot.id, user.id);
    if (success) {
      setSelectedSlot(slot);
      setHeldSlot(slot);
      toast({
        title: "Slot Reserved",
        description: "You have 7 minutes to complete the booking"
      });
    } else {
      toast({
        title: "Slot Unavailable",
        description: "This slot is no longer available",
        variant: "destructive"
      });
      fetchAvailableSlots(); // Refresh slots
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSlot && heldSlot) {
      navigate('/cart', {
        state: {
          providerId,
          serviceId,
          selectedSlot: heldSlot,
          selectedDate: format(selectedDate!, 'yyyy-MM-dd')
        }
      });
    }
  };

  const handleSlotExpired = async () => {
    if (heldSlot && user) {
      await releaseSlot(heldSlot.id, user.id);
      setHeldSlot(null);
      setSelectedSlot(null);
      fetchAvailableSlots();
      toast({
        title: "Slot Expired",
        description: "Your slot reservation has expired",
        variant: "destructive"
      });
    }
  };

  const getTotalPrice = () => {
    if (!selectedServices.length) return 0;
    return selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Select Time Slot
              </h1>
              <p className="text-muted-foreground">
                Choose your preferred appointment time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Summary */}
      {selectedProvider && (
        <div className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedProvider.image}
                alt={selectedProvider.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedProvider.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{selectedProvider.rating} ({selectedProvider.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Available Time Slots
              </h2>
              <p className="text-muted-foreground">
                for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}

          {/* Time Slots */}
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No available time slots for the selected date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col"
                      onClick={() => handleSlotSelect(slot)}
                      disabled={slot.status !== 'available'}
                    >
                      <div className="font-semibold">{slot.slot_time}</div>
                       <div className="text-xs opacity-75">
                         Available
                       </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Summary */}
          {selectedServices.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Services Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedServices.map((service: any) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                      </div>
                      <p className="font-semibold">₹{service.price}</p>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <p className="font-semibold">Total</p>
                    <p className="font-bold text-lg">₹{getTotalPrice()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Countdown Timer and Proceed Button */}
          {heldSlot && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">
                    Slot Reserved: {heldSlot.slot_time}
                  </h3>
                  <SlotCountdownTimer
                    expiresAt={new Date(Date.now() + 7 * 60 * 1000).toISOString()}
                    onExpired={handleSlotExpired}
                  />
                  <Button 
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="w-full"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSelection;