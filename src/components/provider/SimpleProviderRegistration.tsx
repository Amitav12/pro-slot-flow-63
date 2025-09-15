import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SimpleProviderRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    category_id: '',
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    license_number: '',
    experience_years: 0,
    description: ''
  });

  const { user } = useAuth();
  const { categories } = useCategories();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a registration request.",
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
    setUploading(true);

    try {
      // Upload license document
      const licenseUrl = await handleFileUpload(licenseFile);
      
      // Submit registration request
      const { error } = await supabase
        .from('provider_registration_requests')
        .insert({
          user_id: user.id,
          category_id: formData.category_id,
          business_name: formData.business_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          license_number: formData.license_number,
          license_document_url: licenseUrl,
          experience_years: formData.experience_years,
          description: formData.description,
          status: 'pending'
        });

      if (error) {
        console.error('Registration error:', error);
        throw new Error(error.message);
      }

      // Reset form
      setFormData({
        category_id: '',
        business_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        license_number: '',
        experience_years: 0,
        description: ''
      });
      setLicenseFile(null);

      toast({
        title: "Success",
        description: "Your registration request has been submitted successfully. You will be notified once it's reviewed by our admin team.",
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit registration request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setLicenseFile(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Provider Registration Request</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit your registration request to become a service provider. After approval, you'll be able to select subcategories and set your pricing.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <Label htmlFor="category">Service Category *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the category you want to provide services for" />
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

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Your business name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Primary contact person"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Business Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your complete business address"
                rows={3}
                required
              />
            </div>

            {/* License Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="Your professional license number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  placeholder="Years of experience"
                />
              </div>
            </div>

            {/* License Document Upload */}
            <div>
              <Label htmlFor="license_document">License Document *</Label>
              <div className="mt-2">
                <input
                  id="license_document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('license_document')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {licenseFile ? licenseFile.name : 'Upload License Document'}
                </Button>
                {licenseFile && (
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    File selected: {licenseFile.name}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your business and services (optional)"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.category_id || !formData.business_name || !formData.license_number || !licenseFile}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? 'Uploading...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Registration Request'
                )}
              </Button>
            </div>
          </form>

          {/* Information Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your registration request will be reviewed by our admin team</li>
                  <li>Once approved, you'll be able to select specific subcategories</li>
                  <li>You can then set individual pricing for each subcategory you offer</li>
                  <li>After setup, customers will be able to book your services</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};