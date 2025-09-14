import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Gift } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  expires: string;
  layout: 'card' | 'horizontal';
  isActive: boolean;
}

const SpecialOffersManager: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discount: '',
    expires: '',
    layout: 'card' as 'card' | 'horizontal',
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'promotional_offers')
        .single();

      if (data && data.value) {
        const offersData = data.value as any;
        setOffers(offersData.offers || []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const saveOffers = async (updatedOffers: Offer[]) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'promotional_offers',
          value: {
            title: 'Special Offers',
            subtitle: 'Limited time deals',
            offers: updatedOffers
          } as any,
          description: 'Promotional offers section content'
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setOffers(updatedOffers);
      toast({
        title: "Success",
        description: "Offers updated successfully"
      });
    } catch (error) {
      console.error('Error saving offers:', error);
      toast({
        title: "Error",
        description: "Failed to save offers",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOffer: Offer = {
      id: editingOffer?.id || Date.now().toString(),
      ...formData
    };

    let updatedOffers;
    if (editingOffer) {
      updatedOffers = offers.map(offer => 
        offer.id === editingOffer.id ? newOffer : offer
      );
    } else {
      updatedOffers = [...offers, newOffer];
    }

    await saveOffers(updatedOffers);
    resetForm();
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      code: offer.code,
      discount: offer.discount,
      expires: offer.expires,
      layout: offer.layout,
      isActive: offer.isActive
    });
    setIsEditing(true);
  };

  const handleDelete = async (offerId: string) => {
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    await saveOffers(updatedOffers);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      discount: '',
      expires: '',
      layout: 'card',
      isActive: true
    });
    setEditingOffer(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Special Offers</h2>
          <p className="text-muted-foreground">
            Manage promotional offers and deals for your platform
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Offer
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    placeholder="e.g., 20% OFF"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., FIRST20"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expires">Expires</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={formData.expires}
                    onChange={(e) => setFormData({...formData, expires: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="layout">Layout Type</Label>
                <Select 
                  value={formData.layout} 
                  onValueChange={(value: 'card' | 'horizontal') => 
                    setFormData({...formData, layout: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card Format</SelectItem>
                    <SelectItem value="horizontal">Horizontal Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingOffer ? 'Update' : 'Create'} Offer
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{offer.title}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(offer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={offer.layout === 'card' ? 'default' : 'secondary'}>
                  {offer.layout === 'card' ? 'Card' : 'Banner'}
                </Badge>
                <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{offer.description}</p>
                <div className="bg-muted p-2 rounded font-mono text-sm">
                  Code: {offer.code}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-primary">{offer.discount}</span>
                  <span className="text-muted-foreground">Until {offer.expires}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offers.length === 0 && !isEditing && (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No offers yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first special offer to attract customers
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Offer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpecialOffersManager;