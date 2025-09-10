import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Sparkles, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddToCartButton } from '@/components/AddToCartButton';

interface NewService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  rating: number;
  total_bookings: number;
  image_url?: string;
  gallery_images_urls: string[];
  provider_id: string;
  created_at: string;
  subcategories?: {
    name: string;
  };
}

const AllNewServices: React.FC = () => {
  const [services, setServices] = useState<NewService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewServices = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_services')
          .select(`
            id,
            service_name,
            description,
            price,
            duration_minutes,
            rating,
            total_bookings,
            image_url,
            gallery_images_urls,
            provider_id,
            created_at,
            subcategories:subcategory_id (
              name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .eq('is_new', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const processedServices = (data || []).map(service => ({
          ...service,
          gallery_images_urls: Array.isArray(service.gallery_images_urls) 
            ? service.gallery_images_urls as string[]
            : []
        }));
        
        setServices(processedServices);
      } catch (error) {
        console.error('Error fetching new services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewServices();
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
            <Sparkles className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              New Services
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh additions to our platform
          </p>
        </div>
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No New Services Found</h3>
            <p className="text-gray-500">Check back later for new service additions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
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
                      <div className="w-full h-full bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                        <div className="text-6xl text-green-500/30">
                          {service.service_name.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    {/* New Badge */}
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                    
                    {/* Time Added */}
                    <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {getTimeAgo(service.created_at)}
                    </Badge>

                    {/* Gallery Indicator */}
                    {service.gallery_images_urls && service.gallery_images_urls.length > 0 && (
                      <Badge variant="secondary" className="absolute bottom-3 left-3 text-xs">
                        +{service.gallery_images_urls.length} photos
                      </Badge>
                    )}
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
                      {service.description || 'New professional service just added to our platform'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{service.rating || 'New'}</span>
                          <span className="text-xs text-muted-foreground">
                            ({service.total_bookings || 0} bookings)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatDuration(service.duration_minutes)}</span>
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
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        Try Now
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

export default AllNewServices;