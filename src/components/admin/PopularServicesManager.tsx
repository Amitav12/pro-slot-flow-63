import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PopularServicesConfig {
  title: string;
  subtitle: string;
  show_section: boolean;
  service_ids: string[];
}

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
}

export const PopularServicesManager: React.FC = () => {
  const [config, setConfig] = useState<PopularServicesConfig>({
    title: 'Popular Services',
    subtitle: 'Most requested services in your area',
    show_section: true,
    service_ids: []
  });
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch current configuration
      const { data: configData, error: configError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'popular_services')
        .single();

      if (!configError && configData) {
        const popularConfig = configData.value as unknown as PopularServicesConfig;
        setConfig(popularConfig);
      }

      // Fetch all available services
      const { data: servicesData, error: servicesError } = await supabase
        .from('provider_services')
        .select('id, service_name, description, price')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('service_name');

      if (servicesError) throw servicesError;
      setAvailableServices(servicesData || []);

      // Fetch currently selected services
      if (config.service_ids.length > 0) {
        const { data: selectedData, error: selectedError } = await supabase
          .from('provider_services')
          .select('id, service_name, description, price')
          .in('id', config.service_ids);

        if (!selectedError) {
          setSelectedServices(selectedData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load popular services configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = (service: Service) => {
    if (!config.service_ids.includes(service.id)) {
      setConfig(prev => ({
        ...prev,
        service_ids: [...prev.service_ids, service.id]
      }));
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setConfig(prev => ({
      ...prev,
      service_ids: prev.service_ids.filter(id => id !== serviceId)
    }));
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'popular_services',
          value: config as any,
          description: 'Configuration for popular services section on homepage'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Popular services configuration saved successfully"
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save popular services configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Services Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Services Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Popular Services"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Section Subtitle</Label>
            <Input
              id="subtitle"
              value={config.subtitle}
              onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Most requested services in your area"
            />
          </div>
        </div>

        {/* Show Section Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="show_section"
            checked={config.show_section}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, show_section: checked }))}
          />
          <Label htmlFor="show_section">Show Popular Services Section</Label>
        </div>

        {/* Selected Services */}
        <div>
          <Label className="text-base font-semibold">Selected Popular Services</Label>
          <div className="mt-2 space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{service.service_name}</span>
                  <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveService(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {selectedServices.length === 0 && (
              <p className="text-gray-500 text-sm">No services selected. Add services below.</p>
            )}
          </div>
        </div>

        {/* Available Services */}
        <div>
          <Label className="text-base font-semibold">Available Services</Label>
          <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
            {availableServices
              .filter(service => !config.service_ids.includes(service.id))
              .map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{service.service_name}</span>
                    <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                    {service.description && (
                      <p className="text-xs text-gray-400 mt-1">{service.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddService(service)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};