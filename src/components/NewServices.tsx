import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Sparkles, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddToCartButton } from '@/components/AddToCartButton';
import { useNavigate } from 'react-router-dom';

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

interface NewServicesProps {
  onServiceSelect: (service: NewService) => void;
}

export const NewServices: React.FC<NewServicesProps> = ({ onServiceSelect }) => {
  const [services, setServices] = useState<NewService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

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
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        const processedServices = (data || []).map(service => ({
          ...service,
          gallery_images_urls: Array.isArray(service.gallery_images_urls) 
            ? service.gallery_images_urls as string[]
            : []
        }));
        
        setServices(processedServices);
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } catch (error) {
        console.error('Error fetching new services:', error);
        // Still show content even if fetch fails
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
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

  // Don't render anything until content is ready
  if (loading || !isVisible) {
    return null;
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className={`py-8 transition-all duration-700 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold">New Services</h2>
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            Fresh arrivals
          </Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/all-new-services')}
          className="hover:bg-green-600 hover:text-white"
        >
          Explore New
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {services.map((service, index) => (
          <Card
            key={service.id}
            className={`flex-shrink-0 w-80 group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 translate-x-4 animate-slide-in-left`}
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'forwards'
            }}
            onClick={() => onServiceSelect(service)}
          >
            <CardContent className="p-0">
              {/* Service Image/Video */}
              <div className="relative h-40 overflow-hidden rounded-t-lg">
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
                <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
                
                {/* Time Added */}
                <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {getTimeAgo(service.created_at)}
                </Badge>

                {/* Gallery Indicator */}
                {service.gallery_images_urls && service.gallery_images_urls.length > 0 && (
                  <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
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
                  <Button 
                    onClick={() => onServiceSelect(service)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Try Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};