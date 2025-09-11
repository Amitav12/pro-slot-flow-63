
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description: string;
}

export const SettingsManager = () => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as any;
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await (supabase as any)
        .from('admin_settings')
        .update({ value, updated_at: new Date().toISOString() } as any)
        .eq('key' as any, key as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-content'] });
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
      setEditingKey(null);
      setEditingValue(null);
      toast({ title: 'Success', description: 'Settings updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    }
  });

  const handleEdit = (setting: AdminSetting) => {
    setEditingKey(setting.key);
    setEditingValue(setting.value);
  };

  const handleSave = () => {
    if (editingKey) {
      updateSettingMutation.mutate({
        key: editingKey,
        value: editingValue
      });
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditingValue(null);
  };

  const renderValueEditor = (key: string, value: any) => {
    if (key === 'site_stats') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Customers</Label>
              <Input
                type="number"
                value={editingValue?.customers || 0}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  customers: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <Label>Providers</Label>
              <Input
                type="number"
                value={editingValue?.providers || 0}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  providers: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <Label>Rating</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={editingValue?.rating || 0}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  rating: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        </div>
      );
    }

    if (key === 'hero_content') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={editingValue?.title || ''}
              onChange={(e) => setEditingValue({
                ...editingValue,
                title: e.target.value
              })}
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={editingValue?.subtitle || ''}
              onChange={(e) => setEditingValue({
                ...editingValue,
                subtitle: e.target.value
              })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={editingValue?.description || ''}
              onChange={(e) => setEditingValue({
                ...editingValue,
                description: e.target.value
              })}
            />
          </div>
        </div>
      );
    }

    if (key === 'company_info') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={editingValue?.name || ''}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                value={editingValue?.tagline || ''}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  tagline: e.target.value
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={editingValue?.phone || ''}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  phone: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editingValue?.email || ''}
                onChange={(e) => setEditingValue({
                  ...editingValue,
                  email: e.target.value
                })}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Textarea
        value={JSON.stringify(editingValue, null, 2)}
        onChange={(e) => {
          try {
            setEditingValue(JSON.parse(e.target.value));
          } catch (error) {
            // Handle JSON parse error
          }
        }}
        rows={10}
      />
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings Management</h1>
        <p className="text-gray-600">Configure all UI content and system settings</p>
      </div>

      <div className="space-y-6">
        {settings?.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="capitalize">{setting.key.replace('_', ' ')}</CardTitle>
                  <p className="text-gray-600 text-sm">{setting.description}</p>
                </div>
                <div className="flex space-x-2">
                  {editingKey === setting.key ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingKey === setting.key ? (
                renderValueEditor(setting.key, setting.value)
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(setting.value, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
