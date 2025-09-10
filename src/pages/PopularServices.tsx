import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, Clock, Search, ArrowLeft, Heart, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AddToCartButton } from '@/components/AddToCartButton';

interface PopularService {
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
  subcategories?: {
    name: string;
  };
}

const PopularServices: React.FC = () => {
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularServices();
  }, []);

  const fetchPopularServices = async () => {
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
          subcategories:subcategory_id (
            name
          )
        `)
        .eq('status', 'approved')
        .eq('is_active', true)
        .eq('is_popular', true)
        .order('total_bookings', { ascending: false });

      if (error) throw error;
      setServices((data || []).map(service => ({
        ...service,
        gallery_images_urls: Array.isArray(service.gallery_images_urls) 
          ? service.gallery_images_urls as string[]
          : []
      })));
    } catch (error) {
      console.error('Error fetching popular services:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleServiceClick = (serviceId: string) => {
    navigate(`/provider-selection/${serviceId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-8 w-8 text-orange-500 fill-orange-500" />
            <h1 className="text-3xl font-bold">Popular Services</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {services.length} services
            </Badge>
          </div>
          
          <p className="text-lg text-muted-foreground mb-6">
            Discover the most requested services in your area, trusted by thousands of customers
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search popular services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <Card 
                key={service.id} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
              >
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
                    
                    {/* Popular Badge */}
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Most Popular
                    </Badge>
                    
                    {/* Ranking Badge */}
                    <Badge className="absolute top-3 right-3 bg-primary text-white">
                      #{filteredServices.indexOf(service) + 1}
                    </Badge>
                    
                    {/* Heart Icon */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Gallery Indicator */}
                    {service.gallery_images_urls && service.gallery_images_urls.length > 0 && (
                      <Badge variant="secondary" className="absolute bottom-3 left-3 text-xs">
                        +{service.gallery_images_urls.length} photos
                      </Badge>
                    )}
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
                        onClick={() => handleServiceClick(service.id)}
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
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No matching services found' : 'No popular services yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No popular services match "${searchTerm}"`
                  : 'Popular services will appear here as they gain more bookings'
                }
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {services.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-orange/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6">Why These Services Are Popular</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(services.reduce((sum, s) => sum + (s.rating || 4.8), 0) / services.length * 10) / 10}
                </div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {services.reduce((sum, s) => sum + s.total_bookings, 0)}
                </div>
                <p className="text-muted-foreground">Total Bookings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {services.length}
                </div>
                <p className="text-muted-foreground">Popular Services</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PopularServices;