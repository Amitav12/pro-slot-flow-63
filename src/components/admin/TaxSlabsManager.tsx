import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Calculator, Percent, Info } from 'lucide-react';

interface TaxSlab {
  id: string;
  name: string;
  tax_percentage: number;
  minimum_amount?: number;
  maximum_amount?: number;
  is_active: boolean;
  applies_to?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export function TaxSlabsManager() {
  const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tax_percentage: 0,
    minimum_amount: 0,
    maximum_amount: 0,
    description: '',
    applies_to: 'all'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTaxSlabs();
  }, []);

  const loadTaxSlabs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tax_slabs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tax slabs:', error);
        toast({
          title: "Error",
          description: "Failed to load tax slabs",
          variant: "destructive",
        });
        return;
      }

      setTaxSlabs(data || []);
    } catch (error) {
      console.error('Error loading tax slabs:', error);
      toast({
        title: "Error",
        description: "Failed to load tax slabs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('tax_slabs')
        .insert({
          name: formData.name,
          tax_percentage: formData.tax_percentage,
          minimum_amount: formData.minimum_amount || null,
          maximum_amount: formData.maximum_amount || null,
          description: formData.description || null,
          applies_to: formData.applies_to || 'all',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTaxSlabs([data, ...taxSlabs]);
      toast({
        title: "Success",
        description: "Tax slab created successfully",
      });
      
      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error creating tax slab:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tax slab",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('tax_slabs')
        .update({
          name: formData.name,
          tax_percentage: formData.tax_percentage,
          minimum_amount: formData.minimum_amount || null,
          maximum_amount: formData.maximum_amount || null,
          description: formData.description || null,
          applies_to: formData.applies_to || 'all',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTaxSlabs(taxSlabs.map(slab => slab.id === id ? data : slab));
      toast({
        title: "Success",
        description: "Tax slab updated successfully",
      });
      
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating tax slab:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tax slab",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (slab: TaxSlab) => {
    setFormData({
      name: slab.name,
      tax_percentage: slab.tax_percentage,
      minimum_amount: slab.minimum_amount || 0,
      maximum_amount: slab.maximum_amount || 0,
      description: slab.description || '',
      applies_to: slab.applies_to || 'all'
    });
    setEditingId(slab.id);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_slabs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTaxSlabs(taxSlabs.filter(slab => slab.id !== id));
      toast({
        title: "Success",
        description: "Tax slab deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting tax slab:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete tax slab",
        variant: "destructive",
      });
    }
  };

  const toggleSlabStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('tax_slabs')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTaxSlabs(taxSlabs.map(slab => slab.id === id ? data : slab));
      toast({
        title: "Success",
        description: `Tax slab ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling slab status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update slab status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tax_percentage: 0,
      minimum_amount: 0,
      maximum_amount: 0,
      description: '',
      applies_to: 'all'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tax slabs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Tax Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tax slabs will be automatically applied to the total amount during checkout based on the configured percentage rates. 
              Only active tax slabs within the amount range will be applied.
            </p>
          </div>
        </div>
      </div>

      {/* Add New Tax Slab Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tax Slabs ({taxSlabs.length})</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Tax Slab
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Tax Slab' : 'Add New Tax Slab'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tax Slab Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Tax, GST, VAT"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tax_percentage">Tax Rate (%)</Label>
                  <Input
                    id="tax_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 18.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_amount">Minimum Amount ($)</Label>
                  <Input
                    id="minimum_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_amount}
                    onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave 0 for no minimum</p>
                </div>
                <div>
                  <Label htmlFor="maximum_amount">Maximum Amount ($)</Label>
                  <Input
                    id="maximum_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximum_amount}
                    onChange={(e) => setFormData({ ...formData, maximum_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Leave empty for no maximum"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for no maximum</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applies_to">Applies To</Label>
                  <Select value={formData.applies_to} onValueChange={(value) => setFormData({ ...formData, applies_to: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="services">Services Only</SelectItem>
                      <SelectItem value="products">Products Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this tax slab"
                    rows={3}
                  />
                </div>
              </div>



              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update Tax Slab' : 'Create Tax Slab'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tax Slabs List */}
      <div className="grid gap-4">
        {taxSlabs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tax slabs configured yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first tax slab to get started.</p>
            </CardContent>
          </Card>
        ) : (
          taxSlabs.map((slab) => (
            <Card key={slab.id} className={`${!slab.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{slab.name}</h4>
                      <Badge variant={slab.is_active ? 'default' : 'secondary'}>
                        {slab.is_active ? 'Active' : 'Inactive'}
                      </Badge>

                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1 font-medium text-lg text-foreground">
                        <Percent className="w-4 h-4" />
                        {slab.tax_percentage}%
                      </span>
                      {slab.minimum_amount && slab.minimum_amount > 0 && (
                        <span>Min: ${slab.minimum_amount}</span>
                      )}
                      {slab.maximum_amount && (
                        <span>Max: ${slab.maximum_amount}</span>
                      )}
                      {slab.applies_to && slab.applies_to !== 'all' && (
                        <span className="capitalize">({slab.applies_to})</span>
                      )}
                    </div>

                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slab.is_active}
                      onCheckedChange={(checked) => toggleSlabStatus(slab.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(slab)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(slab.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}