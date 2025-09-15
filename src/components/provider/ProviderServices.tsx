import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProviderServices } from '@/hooks/useProviderServices';
import { useCategories } from '@/hooks/useCategories';
import { ServiceModal } from './ServiceModal';

export const ProviderServices = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { services, loading, createService, updateService, deleteService } = useProviderServices();
  const { categories } = useCategories();

  // Check for action=add query parameter to auto-open modal
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
      // Remove the query parameter after opening modal
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings and pricing</p>
        </div>
        <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>

      {/* Services Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {services.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {service.subcategory?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Category: {service.subcategory?.category?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(service.status)}
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>License: {service.license_number}</span>
                  </div>
                  {service.license_document_url && (
                    <a 
                      href={service.license_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Document
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                  
                  {service.status === 'rejected' && (
                    <Button
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Resubmit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Service Card */}
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors"
          onClick={handleAddService}
        >
          <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500 hover:text-blue-600">
            <Plus className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Request New Category</h3>
            <p className="text-sm text-center">
              Request approval to provide services in a new category
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No category requests yet</h3>
            <p className="text-gray-600 mb-6">
              Start by requesting approval for your first service category
            </p>
            <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Request First Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Service Modal */}
      {showModal && (
        <ServiceModal
          service={editingService}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={async (serviceData: any) => {
            if (editingService) {
              await updateService(editingService.id, serviceData);
            } else {
              await createService(serviceData);
            }
          }}
        />
      )}
    </div>
  );
};