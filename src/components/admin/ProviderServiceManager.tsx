import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  FileText,
  User,
  Building
} from 'lucide-react';
import { useProviderServices } from '@/hooks/useProviderServices';
import { ProviderService } from '@/types/categories';

export const ProviderServiceManager = () => {
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { services, loading, updateServiceStatus, toggleServiceActive, deleteService } = useProviderServices();

  const filteredServices = services.filter(service => {
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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

  const handleStatusUpdate = async (serviceId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    await updateServiceStatus(serviceId, newStatus);
  };

  const ServiceDetailsDialog = ({ service, onClose }: { service: ProviderService; onClose: () => void }) => (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Service Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Service Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Service Name</Label>
              <p className="text-lg font-semibold">{service.service_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Price</Label>
              <p className="text-lg font-semibold text-green-600">${service.price}</p>
            </div>
          </div>

          {/* Category Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Category</Label>
              <p>{service.subcategory?.category?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Subcategory</Label>
              <p>{service.subcategory?.name}</p>
              <p className="text-sm text-gray-500">
                Price Range: ${service.subcategory?.min_price} - ${service.subcategory?.max_price}
              </p>
            </div>
          </div>

          {/* Provider Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Provider Name</Label>
              <p className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {service.provider?.full_name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Business Name</Label>
              <p className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                {service.provider?.business_name || 'N/A'}
              </p>
            </div>
          </div>

          {/* License Info */}
          {service.license_number && (
            <div>
              <Label className="text-sm font-medium text-gray-500">License Number</Label>
              <p>{service.license_number}</p>
            </div>
          )}

          {/* Description */}
          {service.description && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-gray-700">{service.description}</p>
            </div>
          )}

          {/* Status and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(service.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Active</Label>
                <div className="mt-1">
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {service.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(service.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(service.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              
              {service.status !== 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate(service.id, 'pending')}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Reset to Pending
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleServiceActive(service.id, !service.is_active)}
              >
                {service.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
          <h1 className="text-3xl font-bold">Provider Services</h1>
          <p className="text-gray-600">Manage and approve provider service registrations</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search services, providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Registrations ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.service_name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.provider?.full_name}</p>
                      {service.provider?.business_name && (
                        <p className="text-sm text-gray-500">{service.provider.business_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.subcategory?.category?.name}</p>
                      <p className="text-sm text-gray-500">{service.subcategory?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-green-600">${service.price}</p>
                       <p className="text-xs text-gray-500">
                         Range: ${(service.subcategory as any)?.min_price || 0} - ${(service.subcategory as any)?.max_price || 999999}
                       </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(service.status)}
                      <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedService(service as any)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {service.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(service.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(service.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No services found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Details Dialog */}
      {selectedService && (
        <ServiceDetailsDialog
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};