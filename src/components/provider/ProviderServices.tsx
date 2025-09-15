import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ServiceModal } from './ServiceModal';
import { SubcategoryPricingSetup } from './SubcategoryPricingSetup';

export const ProviderServices = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showPricingSetup, setShowPricingSetup] = useState(false);
  const [hasApprovedRegistrations, setHasApprovedRegistrations] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services, loading, createService, updateService, deleteService } = useProviderServices();
  const { categories } = useCategories();
  const { user } = useAuth();

  // Check for action=add query parameter to auto-open modal
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
      // Remove the query parameter after opening modal
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Check for approved registrations
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user) return;

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        // Check for registration requests
        const { data: registrations } = await supabase
          .from('provider_registration_requests')
          .select('status')
          .eq('provider_id', profile.id);

        if (!registrations || registrations.length === 0) {
          setRegistrationStatus('none');
          setHasApprovedRegistrations(false);
          return;
        }

        const hasApproved = registrations.some(reg => reg.status === 'approved');
        const hasPending = registrations.some(reg => reg.status === 'pending');

        if (hasApproved) {
          setRegistrationStatus('approved');
          setHasApprovedRegistrations(true);
        } else if (hasPending) {
          setRegistrationStatus('pending');
          setHasApprovedRegistrations(false);
        } else {
          setRegistrationStatus('none');
          setHasApprovedRegistrations(false);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };

    checkRegistrationStatus();
  }, [user]);

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
    if (registrationStatus === 'none') {
      // Navigate to registration page for initial registration
      navigate('/provider/registration');
    } else if (registrationStatus === 'approved') {
      // Show pricing setup for approved providers
      setShowPricingSetup(true);
    } else {
      // For pending status, show info message
      alert('Your registration is still under review. Please wait for approval before setting up services.');
    }
  };

  const handleRegisterService = () => {
    navigate('/provider/registration');
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
        {registrationStatus === 'none' ? (
          <Button onClick={handleRegisterService} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Register the Service
          </Button>
        ) : registrationStatus === 'approved' ? (
          <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Request New Category
          </Button>
        ) : (
          <Button disabled className="bg-gray-400 cursor-not-allowed">
            <AlertCircle className="h-4 w-4 mr-2" />
            Registration Pending
          </Button>
        )}
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
        {registrationStatus === 'approved' && (
          <Card 
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors"
            onClick={handleAddService}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500 hover:text-blue-600">
              <Plus className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">Request New Category</h3>
              <p className="text-sm text-center">
                Set your price for approved categories
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            {registrationStatus === 'none' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started as a Service Provider</h3>
                <p className="text-gray-600 mb-6">
                  Register as a service provider to start offering your services to customers
                </p>
                <Button onClick={handleRegisterService} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Register the Service
                </Button>
              </>
            ) : registrationStatus === 'pending' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Under Review</h3>
                <p className="text-gray-600 mb-6">
                  Your provider registration is being reviewed. You'll be able to set up services once approved.
                </p>
                <Button disabled className="bg-gray-400 cursor-not-allowed">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Awaiting Approval
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services set up yet</h3>
                <p className="text-gray-600 mb-6">
                  Set up pricing for your approved categories to start receiving bookings
                </p>
                <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Up First Service
                </Button>
              </>
            )}
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

      {/* Pricing Setup Modal */}
      {showPricingSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Set Up Your Services</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPricingSetup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <SubcategoryPricingSetup />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};