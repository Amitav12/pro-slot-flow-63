import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ArrowLeft, Award, Shield } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  specialties: string[];
  availability: string;
  basePrice: number;
  experience: number;
  isVerified: boolean;
  responseTime: string;
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    rating: 4.8,
    reviews: 127,
    distance: '0.8 km away',
    image: '/api/placeholder/80/80',
    specialties: ['Facial', 'Deep Cleansing', 'Anti-aging'],
    availability: 'Available today',
    basePrice: 1200,
    experience: 5,
    isVerified: true,
    responseTime: '10 min'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    rating: 4.9,
    reviews: 203,
    distance: '1.2 km away',
    image: '/api/placeholder/80/80',
    specialties: ['Spa Treatments', 'Massage', 'Aromatherapy'],
    availability: 'Available tomorrow',
    basePrice: 1500,
    experience: 8,
    isVerified: true,
    responseTime: '5 min'
  },
  {
    id: '3',
    name: 'Priya Sharma',
    rating: 4.7,
    reviews: 89,
    distance: '2.1 km away',
    image: '/api/placeholder/80/80',
    specialties: ['Waxing', 'Threading', 'Skincare'],
    availability: 'Available today',
    basePrice: 800,
    experience: 3,
    isVerified: true,
    responseTime: '15 min'
  },
  {
    id: '4',
    name: 'Anita Patel',
    rating: 4.9,
    reviews: 156,
    distance: '1.5 km away',
    image: '/api/placeholder/80/80',
    specialties: ['Massage Therapy', 'Reflexology', 'Wellness'],
    availability: 'Available today',
    basePrice: 2000,
    experience: 10,
    isVerified: true,
    responseTime: '8 min'
  }
];

const ProviderSelectionNew: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const { selectedServices = [], category = '' } = location.state || {};

  useEffect(() => {
    // In a real app, filter providers based on selected services
    setProviders(mockProviders);
  }, [selectedServices]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleContinue = () => {
    if (!selectedProvider) {
      return;
    }
    
    const provider = providers.find(p => p.id === selectedProvider);
    navigate('/date-selection', { 
      state: { 
        selectedServices,
        selectedProvider: provider,
        category 
      } 
    });
  };

  const getTotalPrice = () => {
    if (!selectedServices.length) return 0;
    const baseTotal = selectedServices.reduce((sum: number, service: any) => sum + service.price, 0);
    const selectedProviderData = providers.find(p => p.id === selectedProvider);
    return selectedProviderData ? baseTotal : baseTotal;
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
                  Select Service Provider
                </h1>
                <p className="text-muted-foreground">
                  Choose from our verified professionals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <div className="bg-primary/5 border-b">
            <div className="container mx-auto px-4 py-4">
              <h3 className="font-semibold mb-2">Selected Services:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((service: any) => (
                  <Badge key={service.id} variant="secondary">
                    {service.name} - ₹{service.price}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Provider List */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedProvider === provider.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleProviderSelect(provider.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      {provider.isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="bg-green-500 rounded-full p-1">
                            <Shield className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            {provider.name}
                            {provider.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{provider.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({provider.reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Award className="w-4 h-4" />
                              <span className="text-sm">{provider.experience} years exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">
                            ₹{provider.basePrice}
                          </p>
                          <p className="text-sm text-muted-foreground">onwards</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.distance}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          <span>{provider.availability}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Responds in {provider.responseTime}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.specialties.map((specialty, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedProvider && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
              <div className="container mx-auto flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Provider selected
                  </p>
                  <p className="font-semibold">
                    Estimated Total: ₹{getTotalPrice()}
                  </p>
                </div>
                <Button onClick={handleContinue} size="lg" className="px-8">
                  Next: Select Date
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProviderSelectionNew;