import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  specialties: string[];
  availability: string;
  price: number;
}

const ProviderSelection: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch providers for the service
    const fetchProviders = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockProviders: Provider[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          rating: 4.8,
          reviews: 127,
          distance: '0.8 km away',
          image: '/images/provider-1.jpg',
          specialties: ['Facial', 'Deep Cleansing', 'Anti-aging'],
          availability: 'Available today',
          price: 1200
        },
        {
          id: '2',
          name: 'Maria Rodriguez',
          rating: 4.9,
          reviews: 203,
          distance: '1.2 km away',
          image: '/images/provider-2.jpg',
          specialties: ['Spa Treatments', 'Massage', 'Aromatherapy'],
          availability: 'Available tomorrow',
          price: 1500
        },
        {
          id: '3',
          name: 'Priya Sharma',
          rating: 4.7,
          reviews: 89,
          distance: '2.1 km away',
          image: '/images/provider-3.jpg',
          specialties: ['Waxing', 'Threading', 'Skincare'],
          availability: 'Available today',
          price: 800
        }
      ];
      
      setTimeout(() => {
        setProviders(mockProviders);
        setLoading(false);
      }, 1000);
    };

    fetchProviders();
  }, [serviceId]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleContinue = () => {
    if (selectedProvider) {
      navigate(`/scheduling/${serviceId}/${selectedProvider}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding the best providers for you...</p>
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
                Select a Provider
              </h1>
              <p className="text-sm text-gray-600">
                Choose from our verified professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedProvider === provider.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleProviderSelect(provider.id)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({provider.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{provider.price}
                        </p>
                        <p className="text-sm text-gray-500">onwards</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.distance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Clock className="w-4 h-4" />
                        <span>{provider.availability}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedProvider && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            <div className="container mx-auto">
              <Button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                Continue with Selected Provider
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSelection;