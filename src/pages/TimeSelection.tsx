import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price?: number;
}

const TimeSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const { selectedServices = [], selectedProvider, selectedDate, category = '' } = location.state || {};

  useEffect(() => {
    // Generate mock time slots
    const slots: TimeSlot[] = [
      { id: '1', time: '09:00 AM', available: true },
      { id: '2', time: '09:30 AM', available: false },
      { id: '3', time: '10:00 AM', available: true },
      { id: '4', time: '10:30 AM', available: true },
      { id: '5', time: '11:00 AM', available: false },
      { id: '6', time: '11:30 AM', available: true },
      { id: '7', time: '12:00 PM', available: true },
      { id: '8', time: '12:30 PM', available: true },
      { id: '9', time: '02:00 PM', available: true },
      { id: '10', time: '02:30 PM', available: true },
      { id: '11', time: '03:00 PM', available: false },
      { id: '12', time: '03:30 PM', available: true },
      { id: '13', time: '04:00 PM', available: true },
      { id: '14', time: '04:30 PM', available: true },
      { id: '15', time: '05:00 PM', available: true },
      { id: '16', time: '05:30 PM', available: false },
    ];
    setTimeSlots(slots);
  }, [selectedDate]);

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const handleAddToCart = () => {
    if (!selectedTimeSlot) {
      toast({
        title: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
    
    selectedServices.forEach((service: any) => {
      addToCart({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        providerId: selectedProvider?.id,
        providerName: selectedProvider?.name,
        serviceDetails: {
          ...service,
          selectedDate: format(selectedDate, 'yyyy-MM-dd'),
          selectedTime: selectedSlot?.time,
          provider: selectedProvider
        }
      });
    });

    toast({
      title: "Added to cart successfully!",
      description: `${selectedServices.length} service(s) added for ${format(selectedDate, 'PPP')} at ${selectedSlot?.time}`
    });

    navigate('/');
  };

  const handleProceedToPayment = () => {
    if (!selectedTimeSlot) {
      toast({
        title: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please login to proceed to payment",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Add to cart first
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
    
    selectedServices.forEach((service: any) => {
      addToCart({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        providerId: selectedProvider?.id,
        providerName: selectedProvider?.name,
        serviceDetails: {
          ...service,
          selectedDate: format(selectedDate, 'yyyy-MM-dd'),
          selectedTime: selectedSlot?.time,
          provider: selectedProvider
        }
      });
    });

    // Navigate to cart for checkout
    navigate('/cart');
  };

  const getTotalPrice = () => {
    if (!selectedServices.length) return 0;
    return selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
  };

  const getTotalDuration = () => {
    if (!selectedServices.length) return 0;
    return selectedServices.reduce((sum: number, service: any) => sum + service.duration, 0);
  };

  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    const isPM = slot.time.includes('PM');
    return !isPM || (isPM && hour === 12);
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    const isPM = slot.time.includes('PM');
    return isPM && hour !== 12;
  });

  return (
    <Layout>
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

        {/* Booking Summary */}
        <div className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedProvider && (
                  <>
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
                        <CalendarIcon className="w-3 h-3" />
                        <span>{format(selectedDate, 'PPP')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{getTotalPrice()}</p>
                <p className="text-sm text-muted-foreground">{getTotalDuration()} minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Morning
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {morningSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        !slot.available
                          ? 'opacity-50 cursor-not-allowed bg-muted'
                          : selectedTimeSlot === slot.id
                          ? 'ring-2 ring-primary bg-primary text-primary-foreground'
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="font-medium">{slot.time}</div>
                        {!slot.available && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Unavailable
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Afternoon
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {afternoonSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        !slot.available
                          ? 'opacity-50 cursor-not-allowed bg-muted'
                          : selectedTimeSlot === slot.id
                          ? 'ring-2 ring-primary bg-primary text-primary-foreground'
                          : 'hover:shadow-md hover:bg-muted/50'
                      }`}
                      onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="font-medium">{slot.time}</div>
                        {!slot.available && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Unavailable
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Services Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Services Included</h3>
                <div className="space-y-3">
                  {selectedServices.map((service: any) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                      </div>
                      <Badge variant="secondary">₹{service.price}</Badge>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <p className="font-semibold">Total</p>
                    <p className="font-bold text-lg">₹{getTotalPrice()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {selectedTimeSlot && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Time selected: {timeSlots.find(s => s.id === selectedTimeSlot)?.time}
                  </p>
                  <p className="font-semibold">
                    Total: ₹{getTotalPrice()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddToCart}
                    variant="outline"
                    size="lg"
                    className="px-6"
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleProceedToPayment}
                    size="lg"
                    className="px-6"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TimeSelection;