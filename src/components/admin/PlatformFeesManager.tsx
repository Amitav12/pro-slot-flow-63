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
import { Plus, Edit, Trash2, Save, X, DollarSign, Percent } from 'lucide-react';

interface PlatformFee {
  id: string;
  fee_type: 'percentage' | 'fixed_amount';
  fee_value: number;
  minimum_fee?: number | null;
  maximum_fee?: number | null;
  applicable_services?: any;
  applicable_categories?: any;
  is_active: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export function PlatformFeesManager() {
  const [fees, setFees] = useState<PlatformFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fee_type: 'percentage' as 'percentage' | 'fixed_amount',
    fee_value: 0,
    minimum_fee: 0,
    maximum_fee: 0,
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading platform fees:', error);
        toast({
          title: "Error",
          description: "Failed to load platform fees",
          variant: "destructive",
        });
        return;
      }

      const transformedFees: PlatformFee[] = (data || []).map(fee => ({
        id: fee.id,
        fee_type: fee.fee_type as "percentage" | "fixed_amount",
        fee_value: fee.fee_value,
        minimum_fee: fee.minimum_fee,
        maximum_fee: fee.maximum_fee,
        description: fee.description,
        applicable_services: fee.applicable_services,
        applicable_categories: fee.applicable_categories,
        created_by: fee.created_by,
        is_active: fee.is_active,
        created_at: fee.created_at,
        updated_at: fee.updated_at
      }));
      setFees(transformedFees);
    } catch (error) {
      console.error('Error loading platform fees:', error);
      toast({
        title: "Error",
        description: "Failed to load platform fees",
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
        .from('platform_fees')
        .insert({
          fee_type: formData.fee_type,
          fee_value: formData.fee_value,
          minimum_fee: formData.minimum_fee || null,
          maximum_fee: formData.maximum_fee || null,
          description: formData.description || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newFee: PlatformFee = {
        id: data.id,
        fee_type: data.fee_type as "percentage" | "fixed_amount",
        fee_value: data.fee_value,
        minimum_fee: data.minimum_fee,
        maximum_fee: data.maximum_fee,
        description: data.description,
        applicable_services: data.applicable_services,
        applicable_categories: data.applicable_categories,
        created_by: data.created_by,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setFees([newFee, ...fees]);
      toast({
        title: "Success",
        description: "Platform fee created successfully",
      });
      
      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error creating platform fee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create platform fee",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('platform_fees')
        .update({
          fee_type: formData.fee_type,
          fee_value: formData.fee_value,
          minimum_fee: formData.minimum_fee || null,
          maximum_fee: formData.maximum_fee || null,
          description: formData.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedFee: PlatformFee = {
        id: data.id,
        fee_type: data.fee_type as "percentage" | "fixed_amount",
        fee_value: data.fee_value,
        minimum_fee: data.minimum_fee,
        maximum_fee: data.maximum_fee,
        description: data.description,
        applicable_services: data.applicable_services,
        applicable_categories: data.applicable_categories,
        created_by: data.created_by,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setFees(fees.map(fee => fee.id === id ? updatedFee : fee));
      toast({
        title: "Success",
        description: "Platform fee updated successfully",
      });
      
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      console.error('Error updating platform fee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update platform fee",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (fee: PlatformFee) => {
    setFormData({
      fee_type: fee.fee_type,
      fee_value: fee.fee_value,
      minimum_fee: fee.minimum_fee || 0,
      maximum_fee: fee.maximum_fee || 0,
      description: fee.description || ''
    });
    setEditingId(fee.id);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('platform_fees')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setFees(fees.filter(fee => fee.id !== id));
      toast({
        title: "Success",
        description: "Platform fee deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting platform fee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete platform fee",
        variant: "destructive",
      });
    }
  };

  const toggleFeeStatus = async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('platform_fees')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedFee: PlatformFee = {
        id: data.id,
        fee_type: data.fee_type as "percentage" | "fixed_amount",
        fee_value: data.fee_value,
        minimum_fee: data.minimum_fee,
        maximum_fee: data.maximum_fee,
        description: data.description,
        applicable_services: data.applicable_services,
        applicable_categories: data.applicable_categories,
        created_by: data.created_by,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setFees(fees.map(fee => fee.id === id ? updatedFee : fee));
      toast({
        title: "Success",
        description: `Platform fee ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling fee status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update fee status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fee_type: 'percentage',
      fee_value: 0,
      minimum_fee: 0,
      maximum_fee: 0,
      description: ''
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading platform fees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Fee Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Platform Fees ({fees.length})</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Platform Fee
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Platform Fee' : 'Add New Platform Fee'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee_type">Fee Type</Label>
                  <Select value={formData.fee_type} onValueChange={(value: 'percentage' | 'fixed_amount') => setFormData({ ...formData, fee_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Service Fee, Processing Fee"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fee_value">
                    {formData.fee_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </Label>
                  <Input
                    id="fee_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fee_value}
                    onChange={(e) => setFormData({ ...formData, fee_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_fee">Minimum Fee ($)</Label>
                  <Input
                    id="minimum_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_fee}
                    onChange={(e) => setFormData({ ...formData, minimum_fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="maximum_fee">Maximum Fee ($)</Label>
                  <Input
                    id="maximum_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximum_fee}
                    onChange={(e) => setFormData({ ...formData, maximum_fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>



              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update Fee' : 'Create Fee'}
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

      {/* Fees List */}
      <div className="grid gap-4">
        {fees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No platform fees configured yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first platform fee to get started.</p>
            </CardContent>
          </Card>
        ) : (
          fees.map((fee) => (
            <Card key={fee.id} className={`${!fee.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{fee.description || 'Platform Fee'}</h4>
                      <Badge variant={fee.is_active ? 'default' : 'secondary'}>
                        {fee.is_active ? 'Active' : 'Inactive'}
                      </Badge>

                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {fee.fee_type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        {fee.fee_type === 'percentage' ? `${fee.fee_value}%` : `$${fee.fee_value}`}
                      </span>
                      {fee.minimum_fee && (
                        <span>Min: ${fee.minimum_fee}</span>
                      )}
                      {fee.maximum_fee && (
                        <span>Max: ${fee.maximum_fee}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={fee.is_active}
                      onCheckedChange={(checked) => toggleFeeStatus(fee.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(fee)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(fee.id)}
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