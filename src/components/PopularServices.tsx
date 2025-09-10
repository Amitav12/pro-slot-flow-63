import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PopularService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  rating: number;
  total_bookings: number;
  duration_minutes: number;
  image_url?: string;
  subcategories?: {
    name: string;
  };
}

interface PopularServicesConfig {
  title: string;
  subtitle: string;
  show_section: boolean;
  service_ids: string[];
}

export const PopularServices: React.FC = () => {
  const [services, setServices] = useState<PopularService[]>([]);
  const [config, setConfig] = useState<PopularServicesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        // Get admin configuration
        const { data: configData } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'popular_services')
          .single();

        if (!configData?.value) {
          setConfig({
            title: 'Popular Services',
            subtitle: 'Most requested services in your area',
            show_section: true,
            service_ids: []
          });
          setLoading(false);
          return;
        }

        const popularConfig = configData.value as unknown as PopularServicesConfig;
        setConfig(popularConfig);

        if (popularConfig.service_ids?.length > 0) {
          const { data: servicesData } = await supabase
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
              subcategories:subcategory_id (
                name
              )
            `)
            .in('id', popularConfig.service_ids)
            .eq('status', 'approved')
            .eq('is_active', true)
            .limit(6);

          setServices(servicesData || []);
        }
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

  if (loading || !config?.show_section) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-orange-500 fill-orange-500" />
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <Badge variant="secondary" className="ml-2">
            {config.subtitle}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          className="border-purple-600 text-purple-600 hover:bg-purple-50"
          onClick={() => navigate('/all-popular-services')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {services.map((service, index) => (
          <Card
            key={service.id}
            className="flex-shrink-0 w-80 group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="p-0">
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
                
                <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  #{index + 1}
                </Badge>
                
                <Badge variant="secondary" className="absolute bottom-2 left-2">
                  {service.total_bookings} bookings
                </Badge>
              </div>

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