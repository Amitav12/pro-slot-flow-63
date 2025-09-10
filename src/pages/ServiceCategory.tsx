import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  rating: number;
  image_url?: string;
  subcategory?: {
    name: string;
    category: {
      name: string;
    };
  };
}


const ServiceCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchServicesForCategory = async () => {
      if (!category) return;

      try {
        setLoading(true);
        
        // First get the category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('name')
          .eq('id', category)
          .single();

        if (categoryError) throw categoryError;
        setCategoryName(categoryData?.name || '');

        // Fetch services for this category
        const { data: servicesData, error: servicesError } = await supabase
          .from('provider_services')
          .select(`
            id,
            service_name,
            description,
            price,
            duration_minutes,
            rating,
            image_url,
            subcategory:subcategories(
              name,
              category:categories(name)
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .eq('subcategories.category_id', category);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error loading services",
          description: "Failed to load services for this category",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServicesForCategory();
  }, [category]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNext = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }
    
    const selectedServiceData = services.filter(s => selectedServices.includes(s.id));
    navigate('/provider-selection', { 
      state: { 
        selectedServices: selectedServiceData,
        categoryId: category,
        categoryName: categoryName
      } 
    });
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
                  {categoryName ? `${categoryName} Services` : 'Services'}
                </h1>
                <p className="text-muted-foreground">
                  Select the services you'd like to book
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No services found for this category.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-4"
                variant="outline"
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedServices.includes(service.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={service.image_url}
                        alt={service.service_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      {selectedServices.includes(service.id) && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground">
                            ✓ Selected
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {service.service_name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {service.description || 'Professional service'}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{service.rating || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{service.duration_minutes} min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          ${service.price}
                        </span>
                        <Button
                          size="sm"
                          variant={selectedServices.includes(service.id) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceToggle(service.id);
                          }}
                        >
                          {selectedServices.includes(service.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Button */}
              {selectedServices.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
                  <div className="container mx-auto flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="font-semibold">
                        Total: ${services
                          .filter(s => selectedServices.includes(s.id))
                          .reduce((sum, s) => sum + s.price, 0)
                        }
                      </p>
                    </div>
                    <Button onClick={handleNext} size="lg" className="px-8">
                      Next: Choose Provider
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServiceCategory;