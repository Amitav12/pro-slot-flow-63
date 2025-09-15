import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings,
  Plus
} from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { useProviderServices } from '@/hooks/useProviderServices';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubcategoryPricing {
  subcategory_id: string;
  price: number;
  service_name: string;
  description: string;
}

interface ApprovedCategory {
  id: string;
  category_id: string;
  category_name: string;
  status: string;
}

export const SubcategoryPricingSetup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedCategories, setApprovedCategories] = useState<ApprovedCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [subcategoryPricing, setSubcategoryPricing] = useState<SubcategoryPricing[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { subcategories } = useSubcategories(selectedCategory);
  const { createService } = useProviderServices();
  const { toast } = useToast();

  // Fetch approved categories for this provider
  useEffect(() => {
    const fetchApprovedCategories = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('provider_registration_requests')
          .select(`
            id,
            category_id,
            status,
            categories!inner(
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'approved');

        if (error) throw error;

        const approved = data?.map(item => ({
          id: item.id,
          category_id: item.category_id,
          category_name: item.categories?.name || 'Unknown Category',
          status: item.status
        })) || [];

        setApprovedCategories(approved);
      } catch (error) {
        console.error('Error fetching approved categories:', error);
        toast({
          title: "Error",
          description: "Failed to load your approved categories.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedCategories();
  }, [user]);

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories(prev => {
      const newSelection = prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId];
      
      // Update pricing array
      const subcategory = subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory && !prev.includes(subcategoryId)) {
        setSubcategoryPricing(prevPricing => [...prevPricing, {
          subcategory_id: subcategoryId,
          price: subcategory.min_price || 0,
          service_name: `Professional ${subcategory.name}`,
          description: `Expert ${subcategory.name} services with quality guarantee`
        }]);
      } else if (prev.includes(subcategoryId)) {
        setSubcategoryPricing(prevPricing => 
          prevPricing.filter(p => p.subcategory_id !== subcategoryId)
        );
      }
      
      return newSelection;
    });
  };

  const updateSubcategoryPricing = (subcategoryId: string, field: keyof SubcategoryPricing, value: string | number) => {
    setSubcategoryPricing(prev => 
      prev.map(p => p.subcategory_id === subcategoryId ? { ...p, [field]: value } : p)
    );
  };

  const validatePricing = () => {
    return subcategoryPricing.every(pricing => {
      const subcategory = subcategories.find(sub => sub.id === pricing.subcategory_id);
      return subcategory && 
             pricing.price >= (subcategory.min_price || 0) && 
             pricing.price <= (subcategory.max_price || 999999) &&
             pricing.service_name.trim() !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || subcategoryPricing.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subcategory and set pricing.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePricing()) {
      toast({
        title: "Error",
        description: "Please ensure all prices are within the allowed range and service names are provided.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create services for each selected subcategory
      for (const pricing of subcategoryPricing) {
        const serviceData = {
          subcategory_id: pricing.subcategory_id,
          service_name: pricing.service_name,
          description: pricing.description,
          price: pricing.price,
          license_number: '', // This will be filled from the approved registration
          license_document_url: '', // This will be filled from the approved registration
          working_hours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '17:00', available: false },
            sunday: { start: '09:00', end: '17:00', available: false }
          }
        };

        await createService(serviceData);
      }

      // Reset form
      setSelectedCategory('');
      setSelectedSubcategories([]);
      setSubcategoryPricing([]);

      toast({
        title: "Success",
        description: `Successfully submitted ${subcategoryPricing.length} service(s) for approval. You will be notified once they are reviewed.`,
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (approvedCategories.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Categories</h3>
              <p className="text-gray-600">
                You don't have any approved category registrations yet. Please submit a registration request first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Subcategory & Pricing Setup</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select subcategories and set your pricing for approved categories. Each service will be reviewed before going live.
          </p>
        </CardHeader>
        <CardContent>
          {/* Approved Categories */}
          <div className="mb-6">
            <Label className="text-base font-medium">Your Approved Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {approvedCategories.map((category) => (
                <Badge 
                  key={category.id} 
                  variant={selectedCategory === category.category_id ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.category_id);
                    setSelectedSubcategories([]);
                    setSubcategoryPricing([]);
                  }}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {category.category_name}
                </Badge>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subcategory Selection */}
              {subcategories.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Select Subcategories</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subcategory.id}
                          checked={selectedSubcategories.includes(subcategory.id)}
                          onCheckedChange={() => handleSubcategoryToggle(subcategory.id)}
                        />
                        <Label htmlFor={subcategory.id} className="text-sm cursor-pointer flex-1">
                          {subcategory.name}
                          <span className="text-xs text-gray-500 block">
                            Price range: ${subcategory.min_price} - ${subcategory.max_price}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Service Setup */}
              {subcategoryPricing.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Service Details & Pricing</Label>
                  <div className="space-y-4 mt-3 max-h-96 overflow-y-auto">
                    {subcategoryPricing.map((pricing) => {
                      const subcategory = subcategories.find(sub => sub.id === pricing.subcategory_id);
                      return (
                        <Card key={pricing.subcategory_id} className="p-4 border-l-4 border-l-blue-500">
                          <h4 className="font-medium mb-3 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {subcategory?.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Service Name *</Label>
                              <Input
                                value={pricing.service_name}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'service_name', e.target.value)}
                                placeholder="e.g., Professional House Cleaning"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Price ($) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min={subcategory?.min_price || 0}
                                max={subcategory?.max_price || 999999}
                                value={pricing.price}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'price', parseFloat(e.target.value) || 0)}
                                placeholder={`${subcategory?.min_price} - ${subcategory?.max_price}`}
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-sm">Service Description</Label>
                              <Textarea
                                value={pricing.description}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'description', e.target.value)}
                                placeholder="Describe what's included in this service..."
                                rows={3}
                              />
                            </div>
                          </div>
                          {subcategory && (
                            <div className="mt-2 text-xs text-gray-500">
                              Price must be between ${subcategory.min_price} - ${subcategory.max_price}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {subcategoryPricing.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !validatePricing()}
                    className="min-w-40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit {subcategoryPricing.length} Service(s)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          )}

          {/* Information Box */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Setup Process</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Select a category from your approved registrations</li>
                  <li>Choose the subcategories you want to offer services for</li>
                  <li>Set competitive pricing within the allowed range</li>
                  <li>Provide detailed service descriptions</li>
                  <li>Submit for admin review and approval</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};