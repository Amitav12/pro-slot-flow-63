// ServiceGrid Component - Updated to fix AddToCartButton props
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Heart, Play, X } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Debug log to force recompilation
console.log('ServiceGrid component loaded - AddToCartButton props should be correct');

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  rating: number;
  total_bookings: number;
  image_url?: string;
  video_url?: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
    years_of_experience: number;
    profile_image_url?: string;
    total_reviews: number;
  };
  subcategories?: {
    name: string;
  };
}

interface ServiceGridProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onServiceSelect: (service: Service) => void;
  searchTerm?: string;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  selectedCategory,
  selectedSubcategory,
  onServiceSelect,
  searchTerm = ''
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let query = supabase
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
            video_url,
            subcategories:subcategory_id (
              id,
              name,
              category_id
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true);

        if (selectedSubcategory) {
          query = query.eq('subcategory_id', selectedSubcategory);
        } else if (selectedCategory) {
          const { data: subcategories } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_id', selectedCategory);
          
          if (subcategories && subcategories.length > 0) {
            const subcategoryIds = subcategories.map(sub => sub.id);
            query = query.in('subcategory_id', subcategoryIds);
          }
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, selectedSubcategory]);

  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.subcategories?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="skeleton h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No services found</h3>
        <p className="text-muted-foreground">
          {searchTerm 
            ? `No services match "${searchTerm}"`
            : selectedCategory || selectedSubcategory
            ? "No services available in this category"
            : "Try adjusting your search or browse all categories"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedSubcategory ? 'Selected Services' : 
             selectedCategory ? 'Category Services' : 'All Services'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] overflow-hidden">
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.service_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                    <div className="text-6xl text-primary/30">
                      {service.service_name.charAt(0)}
                    </div>
                  </div>
                )}
                
                {service.total_bookings > 10 && (
                  <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                    Popular
                  </Badge>
                )}
                
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900">
                      {service.service_name}
                    </h3>
                    {service.subcategories?.name && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {service.subcategories.name}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(service.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(service.duration_minutes)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description || 'Professional service delivered with care'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{service.rating || 4.8}</span>
                      <span className="text-xs text-muted-foreground">({service.total_bookings})</span>
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
                    providerId={service.provider?.id}
                    providerName={service.provider?.business_name || 'Provider'}
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
                    className="flex-1 bg-primary hover:bg-primary-hover"
                  >
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

// Remove this duplicate declaration - it's causing the merge declaration error
// const ServiceGrid: React.FC = () => {
//   const navigate = useNavigate();
//   const handleServiceClick = (serviceId: string) => {
//     navigate(`/provider-selection/${serviceId}`);
//   };

//   const handleAddToCart = (serviceId: string) => {
//     navigate(`/provider-selection/${serviceId}`);
//   };

//   const handleBookNow = (serviceId: string) => {
//     navigate(`/provider-selection/${serviceId}`);
//   };
// };