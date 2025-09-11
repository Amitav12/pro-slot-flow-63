import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  User,
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useProviderServices } from '@/hooks/useProviderServices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ServiceApprovalManager = () => {
  const { services, loading, updateServiceStatus, refetch } = useProviderServices();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const pendingServices = services.filter(s => s.status === 'pending');
  const approvedServices = services.filter(s => s.status === 'approved');
  const rejectedServices = services.filter(s => s.status === 'rejected');

  const handleApproval = async (serviceId: string, status: 'approved' | 'rejected', notes?: string) => {
    setProcessing(true);
    try {
      // Update service status
      await updateServiceStatus(serviceId, status);
      
      // Add approval notes if provided
      if (notes) {
        await (supabase as any)
          .from('provider_services')
          .update({ 
            approval_notes: notes,
            approved_at: status === 'approved' ? new Date().toISOString() : null
          } as any)
          .eq('id' as any, serviceId as any);
      }

      toast({
        title: "Success",
        description: `Service ${status} successfully`,
      });

      setSelectedService(null);
      setApprovalNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${status} service`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Service Approval Manager</h1>
          <p className="text-gray-600 mt-1">Review and approve provider service registrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingServices.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedServices.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedServices.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Services */}
      {pendingServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Approval ({pendingServices.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingServices.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{service.service_name}</h3>
                        <Badge className={getStatusColor(service.status)}>
                          {getStatusIcon(service.status)}
                          {service.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Provider</p>
                          <p className="font-medium">{service.provider?.full_name || service.provider?.business_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">{service.subcategory?.category?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Subcategory</p>
                          <p className="font-medium">{service.subcategory?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium text-green-600">${service.price}</p>
                        </div>
                      </div>

                      {service.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="text-gray-700">{service.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {service.license_number && (
                          <div>
                            <p className="text-sm text-gray-500">License Number</p>
                            <p className="font-mono text-sm">{service.license_number}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="text-sm">{new Date(service.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {service.license_document_url && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">License Document</p>
                          <a 
                            href={service.license_document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="h-4 w-4" />
                            <span>View License Document</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Services */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.service_name}</h4>
                    <p className="text-sm text-gray-600">
                      {service.provider?.full_name || service.provider?.business_name} • 
                      {service.subcategory?.category?.name} • 
                      {service.subcategory?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(service.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                    {service.status}
                  </Badge>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${service.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Review Service</h2>
                <Button variant="outline" onClick={() => setSelectedService(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{selectedService.service_name}</h3>
                  <p className="text-gray-600">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-medium">{selectedService.provider?.full_name || selectedService.provider?.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-green-600">${selectedService.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{selectedService.subcategory?.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subcategory</p>
                    <p className="font-medium">{selectedService.subcategory?.name}</p>
                  </div>
                </div>

                {selectedService.license_number && (
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-mono">{selectedService.license_number}</p>
                  </div>
                )}

                {selectedService.license_document_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">License Document</p>
                    <a 
                      href={selectedService.license_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View License Document</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApproval(selectedService.id, 'approved', approvalNotes)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Service
                </Button>
                <Button
                  onClick={() => handleApproval(selectedService.id, 'rejected', approvalNotes)}
                  disabled={processing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Service
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedService(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};