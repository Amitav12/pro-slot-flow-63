import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ShoppingCart, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../hooks/useCart';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DateSlot {
  date: string;
  displayDate: string;
  slots: TimeSlot[];
}

const Scheduling: React.FC = () => {
  const { serviceId, providerId } = useParams<{ serviceId: string; providerId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<DateSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch available slots
    const fetchAvailableSlots = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockDates: DateSlot[] = [
        {
          date: '2024-01-15',
          displayDate: 'Today, Jan 15',
          slots: [
            { id: '1', time: '09:00 AM', available: true },
            { id: '2', time: '10:30 AM', available: false },
            { id: '3', time: '12:00 PM', available: true },
            { id: '4', time: '02:30 PM', available: true },
            { id: '5', time: '04:00 PM', available: false },
            { id: '6', time: '05:30 PM', available: true }
          ]
        },
        {
          date: '2024-01-16',
          displayDate: 'Tomorrow, Jan 16',
          slots: [
            { id: '7', time: '09:00 AM', available: true },
            { id: '8', time: '10:30 AM', available: true },
            { id: '9', time: '12:00 PM', available: false },
            { id: '10', time: '02:30 PM', available: true },
            { id: '11', time: '04:00 PM', available: true },
            { id: '12', time: '05:30 PM', available: true }
          ]
        },
        {
          date: '2024-01-17',
          displayDate: 'Wed, Jan 17',
          slots: [
            { id: '13', time: '09:00 AM', available: false },
            { id: '14', time: '10:30 AM', available: true },
            { id: '15', time: '12:00 PM', available: true },
            { id: '16', time: '02:30 PM', available: false },
            { id: '17', time: '04:00 PM', available: true },
            { id: '18', time: '05:30 PM', available: true }
          ]
        }
      ];
      
      setTimeout(() => {
        setAvailableDates(mockDates);
        setSelectedDate(mockDates[0].date);
        setLoading(false);
      }, 1000);
    };

    fetchAvailableSlots();
  }, [serviceId, providerId]);

  const handleAddToCart = () => {
    if (selectedDate && selectedTime) {
      const selectedDateObj = availableDates.find(d => d.date === selectedDate);
      const selectedTimeObj = selectedDateObj?.slots.find(s => s.id === selectedTime);
      
      if (selectedDateObj && selectedTimeObj) {
        addToCart({
          serviceId: serviceId!,
          serviceName: 'Selected Service', // Add service name
          providerId: providerId!,
          providerName: 'Selected Provider', // Add provider name
          price: 1200, // Add actual price
          serviceDetails: {
            date: selectedDate,
            time: selectedTimeObj.time,
            displayDate: selectedDateObj.displayDate
          }
        });
        
        navigate('/cart');
      }
    }
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedTime) {
      const selectedDateObj = availableDates.find(d => d.date === selectedDate);
      const selectedTimeObj = selectedDateObj?.slots.find(s => s.id === selectedTime);
      
      if (selectedDateObj && selectedTimeObj) {
        // Add to cart first
        addToCart({
          serviceId: serviceId!,
          serviceName: 'Selected Service', // Add service name
          providerId: providerId!,
          providerName: 'Selected Provider', // Add provider name
          price: 1200, // Add actual price
          serviceDetails: {
            date: selectedDate,
            time: selectedTimeObj.time,
            displayDate: selectedDateObj.displayDate
          }
        });
        
        // Redirect to cart for checkout
        navigate('/cart');
      }
    }
  };

  const selectedDateData = availableDates.find(d => d.date === selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Select Date & Time
              </h1>
              <p className="text-sm text-gray-600">
                Choose your preferred appointment slot
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {availableDates.map((dateSlot) => (
              <button
                key={dateSlot.date}
                onClick={() => setSelectedDate(dateSlot.date)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedDate === dateSlot.date
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium">{dateSlot.displayDate}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {dateSlot.slots.filter(s => s.available).length} slots available
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDateData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Select Time</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedDateData.slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedTime(slot.id)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    !slot.available
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedDate && selectedTime && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4" style={{ paddingRight: '120px' }}>
            <div className="container mx-auto flex flex-col items-center">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 py-3 text-lg font-medium border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduling;