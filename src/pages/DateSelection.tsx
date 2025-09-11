import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

const DateSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const { selectedServices = [], selectedProvider, category = '' } = location.state || {};

  // Generate next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (!selectedDate) {
      return;
    }
    
    navigate('/time-selection', { 
      state: { 
        selectedServices,
        selectedProvider,
        selectedDate,
        category 
      } 
    });
  };

  const getTotalPrice = () => {
    if (!selectedServices.length) return 0;
    return selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
  };

  const getDayName = (date: Date) => {
    if (isSameDay(date, startOfToday())) return 'Today';
    if (isSameDay(date, addDays(startOfToday(), 1))) return 'Tomorrow';
    return format(date, 'EEE');
  };

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
                  Select Date
                </h1>
                <p className="text-muted-foreground">
                  Choose your preferred appointment date
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
          <div className="max-w-4xl mx-auto">
            {/* Quick Date Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Quick Selection</h3>
              <div className="grid grid-cols-7 gap-2">
                {next7Days.map((date) => (
                  <Card
                    key={date.toISOString()}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedDate && isSameDay(date, selectedDate)
                        ? 'ring-2 ring-primary bg-primary text-primary-foreground'
                        : 'hover:shadow-md hover:bg-muted/50'
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-xs font-medium mb-1">
                        {getDayName(date)}
                      </div>
                      <div className="text-lg font-bold">
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs">
                        {format(date, 'MMM')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
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
            )}
          </div>

          {/* Continue Button */}
          {selectedDate && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date selected: {format(selectedDate, 'PPP')}
                  </p>
                  <p className="font-semibold">
                    Total: ₹{getTotalPrice()}
                  </p>
                </div>
                <Button onClick={handleContinue} size="lg" className="px-8">
                  Next: Select Time
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DateSelection;