import React, { useState, useEffect } from 'react';
import { X, Upload, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    service_name: '',
    subcategory_id: '',
    description: '',
    price: '',
    license_number: '',
    license_document_url: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        subcategory_id: service.subcategory_id || '',
        description: service.description || '',
        price: service.price?.toString() || '',
        license_number: service.license_number || '',
        license_document_url: service.license_document_url || ''
      });
      
      if (service.subcategory?.category_id) {
        setSelectedCategory(service.subcategory.category_id);
      }
    }
  }, [service]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service name is required';
    }

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Please select a subcategory';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price)
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

  const selectedSubcategory = subcategories.find(s => s.id === formData.subcategory_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? 'Edit Service' : 'Add New Service'}
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
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => handleInputChange('service_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.service_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Emergency Plumbing Repair"
              />
              {errors.service_name && (
                <p className="text-red-600 text-sm mt-1">{errors.service_name}</p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setFormData(prev => ({ ...prev, subcategory_id: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subcategory_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!selectedCategory}
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
              {selectedSubcategory && (
                <p className="text-sm text-gray-600 mt-1">
                  Price range: ${selectedSubcategory.min_price} - ${selectedSubcategory.max_price}
                </p>
              )}
            </div>

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
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number (Optional)
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Professional license number"
              />
            </div>

            {/* License Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
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
                {loading ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};