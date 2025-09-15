import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ArrowLeft, Award, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Provider {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url: string;
  address: string;
  response_time_minutes: number;
  status: string;
}

// Providers will be fetched from database based on selected services

const ProviderSelectionNew: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const { selectedServices = [], category = '' } = location.state || {};

  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!selectedServices || selectedServices.length === 0) {
        setProviders([]);
        return;
      }

      try {
        // Get subcategory IDs from selected services
        const subcategoryIds = selectedServices.map((service: any) => service.subcategory_id).filter(Boolean);
        
        if (subcategoryIds.length === 0) {
          setProviders([]);
          return;
        }

        // Fetch providers who offer services in the selected subcategories
        const { data: providerServices, error: servicesError } = await supabase
          .from('provider_services')
          .select(`
            provider_id,
            user_profiles!inner (
              id,
              user_id,
              full_name,
              business_name,
              phone,
              address
            )
          `)
          .in('subcategory_id', subcategoryIds)
          .eq('status', 'approved')
          .eq('is_active', true);

        if (servicesError) throw servicesError;

        if (!providerServices || providerServices.length === 0) {
          setProviders([]);
          return;
        }

        // Get unique provider IDs
        const uniqueProviderIds = [...new Set(providerServices.map((ps: any) => ps.provider_id))];

        // Get provider details from service_providers table
        const { data: serviceProviders, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', providerServices.map((ps: any) => ps.user_profiles?.user_id).filter(Boolean))
          .eq('status', 'approved');

        if (providersError) throw providersError;

        // Combine data and format for UI
        const formattedProviders: Provider[] = uniqueProviderIds.map((providerId: any) => {
          const providerService = providerServices.find((ps: any) => ps.provider_id === providerId);
          const userProfile = providerService?.user_profiles;
          const serviceProvider = serviceProviders?.find((sp: any) => sp.user_id === userProfile?.user_id);
          
          return {
            id: providerId,
            business_name: userProfile?.business_name || serviceProvider?.business_name || 'Professional Service Provider',
            contact_person: userProfile?.full_name || serviceProvider?.contact_person || 'Service Provider',
            phone: userProfile?.phone || serviceProvider?.phone || 'N/A',
            rating: serviceProvider?.rating || 4.5,
            years_of_experience: serviceProvider?.years_of_experience || 2,
            total_reviews: serviceProvider?.total_reviews || 0,
            total_completed_jobs: serviceProvider?.total_completed_jobs || 0,
            profile_image_url: serviceProvider?.profile_image_url || '/placeholder.svg',
            address: userProfile?.address || serviceProvider?.address || 'Location not specified',
            response_time_minutes: serviceProvider?.response_time_minutes || 15,
            status: serviceProvider?.status || 'approved'
          };
        });

        setProviders(formattedProviders);
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: "Error",
          description: "Failed to load providers. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchProviders();
  }, [selectedServices, toast]);

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
                                ({provider.total_reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Award className="w-4 h-4" />
                              <span className="text-sm">{provider.years_of_experience} years exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">
                            {provider.total_completed_jobs} jobs
                          </p>
                          <p className="text-sm text-muted-foreground">completed</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Responds in {provider.response_time_minutes} min</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Contact: {provider.contact_person}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Phone:</p>
                        <div className="text-sm font-medium">
                          {provider.phone}
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