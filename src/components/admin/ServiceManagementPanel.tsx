import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, TrendingUp, Search, Eye, Edit, Image } from 'lucide-react';

interface ServiceWithFlags {
  id: string;
  service_name: string;
  description: string;
  price: number;
  rating: number;
  total_bookings: number;
  image_url?: string;
  gallery_images_urls: string[];
  is_popular: boolean;
  is_new: boolean;
  is_active: boolean;
  status: string;
  provider_id: string;
  subcategories?: {
    name: string;
  };
}

const ServiceManagementPanel: React.FC = () => {
  const [services, setServices] = useState<ServiceWithFlags[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'popular' | 'new'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          id,
          service_name,
          description,
          price,
          rating,
          total_bookings,
          image_url,
          gallery_images_urls,
          is_popular,
          is_new,
          is_active,
          status,
          provider_id,
          subcategories:subcategory_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices((data || []).map(service => ({
        ...service,
        gallery_images_urls: Array.isArray(service.gallery_images_urls) 
          ? service.gallery_images_urls as string[]
          : []
      })));
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateServiceFlag = async (serviceId: string, field: 'is_popular' | 'is_new', value: boolean) => {
    try {
      const { error } = await supabase
        .from('provider_services')
        .update({ [field]: value })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, [field]: value }
          : service
      ));

      toast({
        title: "Success",
        description: `Service ${field === 'is_popular' ? 'popular' : 'new'} status updated`
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive"
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'popular' && service.is_popular) ||
                         (filterStatus === 'new' && service.is_new);

    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Service Management</h2>
        <p className="text-muted-foreground">
          Manage service popularity and new status flags
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Status</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All ({services.length})
                </Button>
                <Button
                  variant={filterStatus === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('popular')}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Popular ({services.filter(s => s.is_popular).length})
                </Button>
                <Button
                  variant={filterStatus === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('new')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  New ({services.filter(s => s.is_new).length})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <div className="relative h-48">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.service_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Image className="h-12 w-12 text-primary/30" />
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {service.is_popular && (
                  <Badge className="bg-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {service.is_new && (
                  <Badge className="bg-green-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>

              {/* Service Status */}
              <div className="absolute top-2 right-2">
                <Badge variant={service.status === 'approved' ? 'default' : 'secondary'}>
                  {service.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {service.service_name}
                  </h3>
                  {service.subcategories?.name && (
                    <Badge variant="outline" className="text-xs">
                      {service.subcategories.name}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(service.price)}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{service.rating || 0}</span>
                    <span>({service.total_bookings} bookings)</span>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`popular-${service.id}`} className="text-sm">
                      Mark as Popular
                    </Label>
                    <Switch
                      id={`popular-${service.id}`}
                      checked={service.is_popular}
                      onCheckedChange={(checked) => 
                        updateServiceFlag(service.id, 'is_popular', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`new-${service.id}`} className="text-sm">
                      Mark as New
                    </Label>
                    <Switch
                      id={`new-${service.id}`}
                      checked={service.is_new}
                      onCheckedChange={(checked) => 
                        updateServiceFlag(service.id, 'is_new', checked)
                      }
                    />
                  </div>
                </div>

                {/* Gallery Images Count */}
                {service.gallery_images_urls && service.gallery_images_urls.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <Image className="h-3 w-3 inline mr-1" />
                    {service.gallery_images_urls.length} additional image(s)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No services match the current filter'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceManagementPanel;