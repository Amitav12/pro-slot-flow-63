import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProviderService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  rating?: number;
  total_bookings?: number;
  duration_minutes?: number;
  status: string;
  is_active: boolean;
  is_popular: boolean;
  subcategories?: {
    name: string;
    categories?: {
      name: string;
    };
  };
  user_profiles?: {
    business_name?: string;
    full_name?: string;
    rating?: number;
    years_of_experience?: number;
  };
}

interface RealServicesListProps {
  limit?: number;
  showPopularOnly?: boolean;
  title?: string;
  subtitle?: string;
}

export const RealServicesList: React.FC<RealServicesListProps> = ({
  limit = 6,
  showPopularOnly = false,
  title = "Featured Services",
  subtitle = "Professional services from verified providers"
}) => {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let query = supabase
          .from('provider_services')
          .select(`
            id,
            service_name,
            description,
            price,
            rating,
            total_bookings,
            duration_minutes,
            status,
            is_active,
            is_popular,
            subcategories!inner(
              name,
              categories!inner(name)
            ),
            user_profiles!provider_id(
              business_name,
              full_name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true);

        if (showPopularOnly) {
          query = query.eq('is_popular', true);
        }

        const { data, error } = await query
          .order('total_bookings', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [limit, showPopularOnly]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
            <div className="bg-gray-50 rounded-lg p-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No services available yet</p>
              <p className="text-gray-400 text-sm mt-2">Services will appear here once providers register them through the admin dashboard</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    {service.is_popular && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-orange-500 text-white border-0">
                        Popular
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {service.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {service.rating || service.user_profiles?.rating || 4.5}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {service.service_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {service.description || 'Professional service for your needs'}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.subcategories?.categories?.name || 'Service'}
                    </span>
                    {service.duration_minutes && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration_minutes} min
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Provider:</strong> {service.user_profiles?.business_name || service.user_profiles?.full_name || 'Professional Service Provider'}
                    {service.user_profiles?.years_of_experience && (
                      <span className="text-gray-500"> • {service.user_profiles.years_of_experience} years exp.</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-gray-900">
                    ${service.price}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {service.total_bookings || 0} bookings
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};