import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/categories';
import { useSubcategories } from '@/hooks/useCategories';

interface ServiceModalProps {
  service?: any;
  categories: any[];
  onClose: () => void;
  onSave: (serviceData: any) => Promise<void>;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  categories,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    description: '',
    price: '',
    license_number: '',
    license_document_url: ''
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { subcategories } = useSubcategories(formData.category_id);

  useEffect(() => {
    if (service) {
      setFormData({
        category_id: service.category_id || '',
        subcategory_id: service.subcategory_id || '',
        description: service.description || '',
        price: service.price || '',
        license_number: service.license_number || '',
        license_document_url: service.license_document_url || ''
      });
    }
  }, [service]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset subcategory when category changes
      ...(field === 'category_id' ? { subcategory_id: '' } : {})
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Please select a subcategory';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = 'License number is required';
    }

    if (!licenseFile && !formData.license_document_url) {
      newErrors.license_document = 'License document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      if (errors.license_document) {
        setErrors(prev => ({ ...prev, license_document: null }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        licenseFile
      };

      if (service) {
        await (onSave as any)(service.id, serviceData);
      } else {
        await (onSave as any)(serviceData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Register for the Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
              )}
            </div>

            {/* Subcategory Selection */}
            {formData.category_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.subcategory_id}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your service, what's included, and any special features..."
              ></textarea>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Service price"
                required
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Professional license number"
                required
              />
              {errors.license_number && (
                <p className="text-red-600 text-sm mt-1">{errors.license_number}</p>
              )}
            </div>
            {/* End of License Number Section */}

            {/* License Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Document *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {licenseFile ? licenseFile.name : 'Click to upload or drag and drop'}
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="license-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('license-upload')?.click()}
                  className="mb-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
              {errors.license_document && (
                <p className="text-red-600 text-sm mt-1">{errors.license_document}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Registering...' : 'Register the Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
