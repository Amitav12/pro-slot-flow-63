import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddToCartButton } from '@/components/AddToCartButton';

interface PopularService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  rating: number;
  total_bookings: number;
  duration_minutes: number;
  image_url?: string;
  video_url?: string;
  provider_id: string;
  subcategories?: {
    name: string;
  };
}

const AllPopularServices: React.FC = () => {
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_services')
          .select(`
            id,
            service_name,
            description,
            price,
            rating,
            total_bookings,
            duration_minutes,
            image_url,
            video_url,
            provider_id,
            subcategories:subcategory_id (
              name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .eq('is_popular', true)
          .order('total_bookings', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching popular services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularServices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-8 w-8 text-orange-500 fill-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Popular Services
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Most requested services in your area
          </p>
        </div>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Popular Services Found</h3>
            <p className="text-gray-500">Check back later for trending services in your area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.service_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <div className="text-6xl text-primary/30">
                          {service.service_name.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    {/* Trending Badge */}
                    <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      #{index + 1}
                    </Badge>
                    
                    {/* Bookings Count */}
                    <Badge variant="secondary" className="absolute bottom-3 left-3">
                      {service.total_bookings} bookings
                    </Badge>
                  </div>

                  {/* Service Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {service.service_name}
                      </h3>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    {service.subcategories?.name && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {service.subcategories.name}
                      </Badge>
                    )}

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description || 'Professional service at your doorstep'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating || 4.5}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <AddToCartButton 
                        serviceId={service.id}
                        serviceName={service.service_name}
                        providerId={service.provider_id}
                        providerName="Provider"
                        price={service.price}
                        serviceDetails={{
                          duration_minutes: service.duration_minutes,
                          description: service.description,
                          subcategory: service.subcategories?.name
                        }}
                        className="flex-1" 
                      />
                      <Button className="flex-1">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllPopularServices;