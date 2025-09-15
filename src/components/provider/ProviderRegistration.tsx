import React, { useState, useEffect } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Upload,
  Loader2,
  CheckCircle,
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Category, Subcategory } from '@/types/database';

interface ProviderRegistrationData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  locationId: string;
  address: string;
  businessType: string;
  licenseNumber: string;
  description: string;
  selectedCategories: string[];
}

export const ProviderRegistration = () => {
  const { locations, loading: locationsLoading } = useLocations();
  const [formData, setFormData] = useState<ProviderRegistrationData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    locationId: '',
    address: '',
    businessType: '',
    licenseNumber: '',
    description: '',
    selectedCategories: []
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const businessTypes = [
    'Cleaning Services',
    'Home Maintenance',
    'Beauty & Wellness',
    'Fitness & Health',
    'Automotive',
    'Technology',
    'Other'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: keyof ProviderRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: checked 
        ? [...prev.selectedCategories, categoryId]
        : prev.selectedCategories.filter(id => id !== categoryId)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service category.",
        variant: "destructive"
      });
      return;
    }
    
    if (!licenseFile) {
      toast({
        title: "Error",
        description: "Please upload your license document.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload license file
      const fileExt = licenseFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('licenses')
        .upload(fileName, licenseFile);
      
      if (uploadError) throw uploadError;
      
      // Insert provider data
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          location_id: formData.locationId,
          business_address: formData.address,
          business_type: formData.businessType,
          license_number: formData.licenseNumber,
          license_document_url: uploadData.path,
          description: formData.description,
          approval_status: 'pending',
          is_active: false
        })
        .select()
        .single();
      
      if (providerError) throw providerError;
      
      // Insert provider categories
      const categoryInserts = formData.selectedCategories.map(categoryId => ({
        provider_id: providerData.id,
        category_id: categoryId
      }));
      
      const { error: categoryError } = await supabase
        .from('provider_categories')
        .insert(categoryInserts);
      
      if (categoryError) throw categoryError;
      
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your registration has been submitted for admin approval."
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="card-elevated text-center">
          <CardContent className="p-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering as a service provider. We'll review your application 
              and license documentation within 2-3 business days.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive an email confirmation once your account is approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Service Provider Registration
        </h1>
        <p className="text-gray-600">
          Join our platform and start offering your services to customers in your area.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Business Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="input-primary w-full"
                  placeholder="Your Business Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner/Manager Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="input-primary w-full"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-primary w-full"
                  placeholder="business@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input-primary w-full"
                  placeholder="+1 (506) 555-0123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="input-primary w-full"
                  required
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="input-primary w-full"
                  placeholder="Business License Number"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Location Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Location *
                </label>
                {locationsLoading ? (
                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Loading locations...</span>
                  </div>
                ) : (
                  <select
                    value={formData.locationId}
                    onChange={(e) => handleInputChange('locationId', e.target.value)}
                    className="input-primary w-full"
                    required
                  >
                    <option value="">Select Service Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}, {location.city}, {location.province}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="input-primary w-full"
                  placeholder="Street Address"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Service Categories</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select the service categories you provide *
              </label>
              {loadingCategories ? (
                <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">Loading categories...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={formData.selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {formData.selectedCategories.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected categories: {formData.selectedCategories.length}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* License Documentation */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">License Documentation</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Business License *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your business license or certification
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="license-upload"
                  required
                />
                <label
                  htmlFor="license-upload"
                  className="btn-secondary cursor-pointer inline-block"
                >
                  Choose File
                </label>
                {licenseFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {licenseFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Description */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Business Description</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Services *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-primary w-full h-32 resize-none"
                placeholder="Tell customers about your business, experience, and the services you provide..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              'Submit Registration'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};