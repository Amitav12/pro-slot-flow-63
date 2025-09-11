
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  subcategory_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
  subcategories?: { name: string; categories: { name: string } };
}

export const ServiceManager = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          *,
          subcategories (
            name,
            categories (name)
          )
        `)
        .order('display_order');
      
      if (error) throw error;
      return data as any;
    }
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories-for-services'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('subcategories')
        .select('id, name, categories(name)')
        .eq('is_active' as any, true as any)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, 'id'>) => {
      const { data, error } = await supabase
        .from('provider_services')
        .insert([service as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setIsCreating(false);
      toast({ title: 'Success', description: 'Service created successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to create service',
        variant: 'destructive'
      });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { subcategories, ...serviceData } = service;
      const { data, error } = await (supabase as any)
        .from('provider_services')
        .update(serviceData as any)
        .eq('id' as any, service.id as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setEditingService(null);
      toast({ title: 'Success', description: 'Service updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update service',
        variant: 'destructive'
      });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('provider_services')
        .delete()
        .eq('id' as any, id as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Success', description: 'Service deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete service',
        variant: 'destructive'
      });
    }
  });

  const ServiceForm = ({ service, onSave, onCancel }: {
    service: Partial<Service>;
    onSave: (service: Omit<Service, 'id'> | Service) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      subcategory_id: service.subcategory_id || '',
      name: service.name || '',
      description: service.description || '',
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 60,
      is_popular: service.is_popular || false,
      display_order: service.display_order || 0,
      is_active: service.is_active ?? true
    });

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{service.id ? 'Edit Service' : 'New Service'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories?.map((subcategory: any) => (
                    <SelectItem key={subcategory?.id} value={subcategory?.id}>
                      {subcategory?.categories?.name} - {subcategory?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Service name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Service description"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="is_popular">Popular Service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => onSave(service.id ? { ...formData, id: service.id } : formData)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-gray-600">Manage individual services and their pricing</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {isCreating && (
        <ServiceForm
          service={{}}
          onSave={(service) => createServiceMutation.mutate(service as Omit<Service, 'id'>)}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingService && (
        <ServiceForm
          service={editingService}
          onSave={(service) => updateServiceMutation.mutate(service as Service)}
          onCancel={() => setEditingService(null)}
        />
      )}

      <div className="grid gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-lg font-bold text-primary">${service.price}</span>
                    <span className="text-sm text-gray-500">{service.duration_minutes} min</span>
                    <span className="text-sm text-gray-500">
                      {service.subcategories?.categories?.name} - {service.subcategories?.name}
                    </span>
                    <div className="flex space-x-2">
                      {service.is_popular && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Popular</span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteServiceMutation.mutate(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
