import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Upload,
  File,
  X
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { useProviderServices } from '@/hooks/useProviderServices';
import { CreateProviderServiceData } from '@/types/categories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubcategoryPricing {
  subcategory_id: string;
  price: number;
  service_name: string;
  description: string;
}

export const ServiceRegistration = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [pricingMode, setPricingMode] = useState<'bulk' | 'individual'>('bulk');
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [subcategoryPricing, setSubcategoryPricing] = useState<SubcategoryPricing[]>([]);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    license_number: '',
    working_hours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '17:00', available: false },
      sunday: { start: '09:00', end: '17:00', available: false }
    }
  });

  const { user } = useAuth();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories(selectedCategory);
  const { services, loading, createService, deleteService } = useProviderServices();
  const { toast } = useToast();

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `licenses/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories(prev => {
      const newSelection = prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId];
      
      // Update individual pricing array
      if (pricingMode === 'individual') {
        const subcategory = subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory && !prev.includes(subcategoryId)) {
          setSubcategoryPricing(prevPricing => [...prevPricing, {
            subcategory_id: subcategoryId,
            price: subcategory.min_price,
            service_name: `${subcategory.name} Service`,
            description: ''
          }]);
        } else if (prev.includes(subcategoryId)) {
          setSubcategoryPricing(prevPricing => 
            prevPricing.filter(p => p.subcategory_id !== subcategoryId)
          );
        }
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
    if (pricingMode === 'bulk') {
      return selectedSubcategories.every(subId => {
        const subcategory = subcategories.find(sub => sub.id === subId);
        return subcategory && bulkPrice >= subcategory.min_price && bulkPrice <= subcategory.max_price;
      });
    } else {
      return subcategoryPricing.every(pricing => {
        const subcategory = subcategories.find(sub => sub.id === pricing.subcategory_id);
        return subcategory && pricing.price >= subcategory.min_price && pricing.price <= subcategory.max_price;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.license_number.trim()) {
      toast({
        title: "License Number Required",
        description: "Please enter your license number",
        variant: "destructive",
      });
      return;
    }

    if (!licenseFile) {
      toast({
        title: "License Document Required",
        description: "Please upload your license document",
        variant: "destructive",
      });
      return;
    }

    if (!validatePricing()) {
      toast({
        title: "Invalid Pricing",
        description: "Please check that all prices are within the allowed range",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload license document (required)
      const licenseUrl = await handleFileUpload(licenseFile);
      
      // Create services for each selected subcategory
      const servicesToCreate = pricingMode === 'bulk' 
        ? selectedSubcategories.map(subId => {
            const subcategory = subcategories.find(sub => sub.id === subId);
            return {
              subcategory_id: subId,
              service_name: `${subcategory?.name} Service`,
              description: `Professional ${subcategory?.name} service`,
              price: bulkPrice,
              license_number: formData.license_number,
              license_document_url: licenseUrl,
              working_hours: formData.working_hours
            };
          })
        : subcategoryPricing.map(pricing => ({
            subcategory_id: pricing.subcategory_id,
            service_name: pricing.service_name,
            description: pricing.description,
            price: pricing.price,
            license_number: formData.license_number,
            license_document_url: licenseUrl,
            working_hours: formData.working_hours
          }));

      // Create all services
      for (const serviceData of servicesToCreate) {
        await createService(serviceData);
      }

      // Reset form
      setIsCreating(false);
      setSelectedCategory('');
      setSelectedSubcategories([]);
      setSubcategoryPricing([]);
      setLicenseFile(null);
      setBulkPrice(0);
      setFormData({
        license_number: '',
        working_hours: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '17:00', available: false },
          sunday: { start: '09:00', end: '17:00', available: false }
        }
      });

      toast({
        title: "Success",
        description: `${servicesToCreate.length} service(s) registered successfully and pending admin approval`,
      });
    } catch (error: any) {
      console.error('Error creating services:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register services",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-gray-600">Register and manage your service offerings</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register New Service
        </Button>
      </div>

      {/* Service Registration Dialog */}
      {isCreating && (
        <Dialog open={true} onOpenChange={() => setIsCreating(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Services</DialogTitle>
              <p className="text-sm text-gray-600">Select multiple subcategories and set pricing for your services</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Required:</span> License number and license document upload are mandatory for service registration.
                </p>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Selection */}
              {selectedCategory && subcategories.length > 0 && (
                <div>
                  <Label>Select Subcategories</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto border rounded-lg p-4">
                    {subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subcategory.id}
                          checked={selectedSubcategories.includes(subcategory.id)}
                          onCheckedChange={() => handleSubcategoryToggle(subcategory.id)}
                        />
                        <Label htmlFor={subcategory.id} className="text-sm cursor-pointer">
                          {subcategory.name}
                          <span className="text-xs text-gray-500 block">
                            ${subcategory.min_price} - ${subcategory.max_price}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Mode Selection */}
              {selectedSubcategories.length > 0 && (
                <div>
                  <Label>Pricing Mode</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bulk"
                        name="pricingMode"
                        value="bulk"
                        checked={pricingMode === 'bulk'}
                        onChange={(e) => setPricingMode(e.target.value as 'bulk' | 'individual')}
                      />
                      <Label htmlFor="bulk">Same price for all services</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="individual"
                        name="pricingMode"
                        value="individual"
                        checked={pricingMode === 'individual'}
                        onChange={(e) => setPricingMode(e.target.value as 'bulk' | 'individual')}
                      />
                      <Label htmlFor="individual">Individual pricing</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Pricing */}
              {pricingMode === 'bulk' && selectedSubcategories.length > 0 && (
                <div>
                  <Label htmlFor="bulkPrice">Price for All Services ($)</Label>
                  <Input
                    id="bulkPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Enter price for all selected services"
                    required
                  />
                  {!validatePricing() && bulkPrice > 0 && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        Price must be within the range for all selected subcategories
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Pricing */}
              {pricingMode === 'individual' && subcategoryPricing.length > 0 && (
                <div>
                  <Label>Individual Service Details</Label>
                  <div className="space-y-4 mt-2 max-h-60 overflow-y-auto">
                    {subcategoryPricing.map((pricing) => {
                      const subcategory = subcategories.find(sub => sub.id === pricing.subcategory_id);
                      return (
                        <Card key={pricing.subcategory_id} className="p-4">
                          <h4 className="font-medium mb-3">{subcategory?.name}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Service Name</Label>
                              <Input
                                value={pricing.service_name}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'service_name', e.target.value)}
                                placeholder="Service name"
                                required
                              />
                            </div>
                            <div>
                              <Label>Price ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min={subcategory?.min_price}
                                max={subcategory?.max_price}
                                value={pricing.price}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'price', parseFloat(e.target.value) || 0)}
                                placeholder={`${subcategory?.min_price} - ${subcategory?.max_price}`}
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={pricing.description}
                                onChange={(e) => updateSubcategoryPricing(pricing.subcategory_id, 'description', e.target.value)}
                                placeholder="Service description"
                                rows={2}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* License Information - REQUIRED */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number" className="flex items-center space-x-1">
                    <span>License Number</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="Enter your professional license number"
                    required
                    className={!formData.license_number.trim() ? 'border-red-300' : ''}
                  />
                  {!formData.license_number.trim() && (
                    <p className="text-xs text-red-600 mt-1">License number is required</p>
                  )}
                </div>
                <div>
                  <Label className="flex items-center space-x-1">
                    <span>License Document</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <FileUpload
                    onFileSelect={setLicenseFile}
                    selectedFile={licenseFile}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    maxSize={10}
                    placeholder="Upload your professional license document"
                  />
                  {!licenseFile && (
                    <p className="text-xs text-red-600 mt-1">License document is required</p>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <Label>Working Hours</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {Object.entries(formData.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Checkbox
                        checked={hours.available}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            working_hours: {
                              ...prev.working_hours,
                              [day]: { ...hours, available: !!checked }
                            }
                          }))
                        }
                      />
                      <div className="w-20 capitalize font-medium">{day}</div>
                      {hours.available && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) => 
                              setFormData(prev => ({
                                ...prev,
                                working_hours: {
                                  ...prev.working_hours,
                                  [day]: { ...hours, start: e.target.value }
                                }
                              }))
                            }
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) => 
                              setFormData(prev => ({
                                ...prev,
                                working_hours: {
                                  ...prev.working_hours,
                                  [day]: { ...hours, end: e.target.value }
                                }
                              }))
                            }
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    selectedSubcategories.length === 0 || 
                    !validatePricing() ||
                    !formData.license_number.trim() ||
                    !licenseFile ||
                    uploading
                  }
                >
                  {uploading ? 'Uploading License & Creating Services...' : `Register ${selectedSubcategories.length} Service(s)`}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Services List */}
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{service.service_name}</h3>
                    {getStatusBadge(service.status)}
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{service.subcategory?.category?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subcategory</p>
                      <p className="font-medium">{service.subcategory?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Your Price</p>
                      <p className="font-medium text-green-600">${service.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price Range</p>
                      <p className="text-sm">${(service.subcategory as any)?.min_price || 0} - ${(service.subcategory as any)?.max_price || 999999}</p>
                    </div>
                  </div>

                  {service.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{service.description}</p>
                    </div>
                  )}

                  {service.license_number && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-mono text-sm">{service.license_number}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteService(service.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {service.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Service Rejected</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Please review your service details and resubmit with corrections.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No services registered yet</h3>
            <p className="text-gray-600 mb-4">Register your first service to start receiving bookings</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Register Your First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};