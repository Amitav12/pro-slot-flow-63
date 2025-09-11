import React, { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Upload,
  Loader2,
  CheckCircle
} from 'lucide-react';

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
  services: string[];
}

export const ProviderRegistration: React.FC = () => {
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
    services: []
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const businessTypes = [
    'Cleaning Services',
    'Home Maintenance',
    'Beauty & Wellness',
    'Fitness & Health',
    'Automotive',
    'Technology',
    'Other'
  ];

  const handleInputChange = (field: keyof ProviderRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Here you would typically upload the license file and submit the registration
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Provider registration data:', formData);
      console.log('License file:', licenseFile);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            disabled={submitting}
            className="btn-primary px-8 py-3"
          >
            {submitting ? (
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