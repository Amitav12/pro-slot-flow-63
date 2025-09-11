import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Provider {
  id: string;
  business_name: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url?: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
}

interface ProviderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onProviderSelect: (provider: Provider) => void;
}

export const ProviderSelectionModal: React.FC<ProviderSelectionModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onProviderSelect
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchProviders();
    }
  }, [isOpen, serviceId]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Get all approved providers
      const { data: providersData, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (providersError) throw providersError;

      const formattedProviders: Provider[] = providersData?.map(provider => ({
        id: provider.id,
        business_name: provider.business_name || 'Professional Service Provider',
        rating: provider.rating || 0,
        years_of_experience: provider.years_of_experience || 0,
        total_reviews: provider.total_reviews || 0,
        total_completed_jobs: provider.total_completed_jobs || 0,
        profile_image_url: provider.profile_image_url || undefined,
        specializations: Array.isArray(provider.specializations) ? 
          (provider.specializations as any[]).filter(s => typeof s === 'string') : [],
        certifications: Array.isArray(provider.certifications) ? 
          (provider.certifications as any[]).filter(c => typeof c === 'string') : [],
        response_time_minutes: provider.response_time_minutes || 15
      })) || [];

      setProviders(formattedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleConfirmSelection = () => {
    if (selectedProvider) {
      onProviderSelect(selectedProvider);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Your Service Provider
          </DialogTitle>
          <p className="text-muted-foreground">
            Select a professional for: {serviceName}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                  selectedProvider?.id === provider.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    {/* Provider Image */}
                    <div className="flex-shrink-0">
                      {provider.profile_image_url ? (
                        <img
                          src={provider.profile_image_url}
                          alt={provider.business_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xl font-semibold">
                            {provider.business_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {provider.business_name}
                        </h3>
                        {selectedProvider?.id === provider.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            ({provider.total_reviews} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            {provider.years_of_experience}+ years experience
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {provider.total_completed_jobs} jobs completed
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Responds in ~{provider.response_time_minutes} minutes
                        </span>
                      </div>

                      {/* Specializations */}
                      {provider.specializations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-foreground mb-2">Specializations:</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.specializations.map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {provider.certifications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Certifications:</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {providers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👨‍🔧</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No providers available
                </h3>
                <p className="text-muted-foreground">
                  We're working to add more professionals for this service.
                </p>
              </div>
            )}

            {selectedProvider && (
              <div className="flex justify-end space-x-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmSelection}>
                  Continue with {selectedProvider.business_name}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};