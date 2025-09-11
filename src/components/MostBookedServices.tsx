import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Clock, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MostBookedService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  rating: number;
  total_bookings: number;
  duration_minutes: number;
  image_url?: string;
  video_url?: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
  };
  subcategories?: {
    name: string;
  };
}

interface MostBookedServicesProps {
  onServiceSelect: (service: MostBookedService) => void;
}

export const MostBookedServices: React.FC<MostBookedServicesProps> = ({ onServiceSelect }) => {
  const [services, setServices] = useState<MostBookedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMostBookedServices = async () => {
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
            subcategories:subcategory_id (
              name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .eq('is_popular', true)
          .order('total_bookings', { ascending: false })
          .limit(6);

        if (error) throw error;
        setServices(data || []);
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } catch (error) {
        console.error('Error fetching most booked services:', error);
        // Still show content even if fetch fails
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } finally {
        setLoading(false);
      }
    };

    fetchMostBookedServices();
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

  // Don't render anything until content is ready
  if (loading || !isVisible) {
    return null;
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className={`mb-12 transition-all duration-700 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
          <h2 className="text-2xl font-bold">Popular Services</h2>
          <Badge variant="secondary" className="ml-2">
            Most requested services in your area
          </Badge>
        </div>
        <Button 
          variant="outline" 
          className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 transition-all duration-300 ease-out transform hover:scale-105"
          onClick={() => {
            console.log('Popular Services View All clicked - navigating to /all-popular-services');
            try {
              navigate('/all-popular-services');
            } catch (error) {
              console.error('Navigation failed, using fallback:', error);
              window.location.href = '/all-popular-services';
            }
          }}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
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
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl text-primary/30">
                      {service.service_name.charAt(0)}
                    </div>
                  </div>
                )}
                
                {/* Trending Badge */}
                <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  #{services.indexOf(service) + 1}
                </Badge>
                
                {/* Bookings Count */}
                <Badge variant="secondary" className="absolute bottom-2 left-2">
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

                <div className="flex items-center justify-between text-sm">
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
                  
                  <Button size="sm" className="hover:scale-105 transition-transform">
                    Book Now
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