import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProviderRegistrationRequest {
  id: string;
  user_id: string;
  category_id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  license_number: string;
  license_document_url: string | null;
  id_document_url: string | null;
  business_registration_url: string | null;
  experience_years: number;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
  category_name?: string;
  user_email?: string;
}

export const ServiceRegisterRequestSection = () => {
  const [requests, setRequests] = useState<ProviderRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProviderRegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const { user, isRole } = useAuth();

  const canManageRequests = isRole('admin') || isRole('super_admin');



  useEffect(() => {
    if (canManageRequests) {
      fetchRequests();
    }
  }, [canManageRequests, filter]);

  // Add sample data function
  const addSampleData = async () => {
    try {
      const { data: users } = await supabase.from('auth.users').select('id').limit(1);
      const { data: categories } = await supabase.from('categories').select('id').limit(1);
      
      if (!users?.length || !categories?.length) {
        toast({
          title: "Error",
          description: "No users or categories found to create sample data",
          variant: "destructive"
        });
        return;
      }

      const sampleRequests = [
        {
          user_id: users[0].id,
          category_id: categories[0].id,
          business_name: 'Elite Cleaning Services',
          contact_person: 'Sarah Johnson',
          phone: '+1-555-0123',
          email: 'sarah@elitecleaning.com',
          address: '123 Main Street, Downtown City',
          license_number: 'CL-2024-001',
          experience_years: 5,
          description: 'Professional cleaning service with 5 years of experience.',
          status: 'pending'
        },
        {
          user_id: users[0].id,
          category_id: categories[0].id,
          business_name: 'Beauty Masters Spa',
          contact_person: 'Lisa Chen',
          phone: '+1-555-0456',
          email: 'lisa@beautymasters.com',
          address: '456 Beauty Boulevard, Spa District',
          license_number: 'BT-2024-002',
          experience_years: 8,
          description: 'Full-service beauty spa offering facial treatments and wellness services.',
          status: 'pending'
        }
      ];

      const { error } = await supabase
        .from('provider_registration_requests')
        .insert(sampleRequests);

      if (error) {
        console.error('Error adding sample data:', error);
        toast({
          title: "Error",
          description: "Failed to add sample data: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Sample provider registration requests added successfully"
        });
        fetchRequests();
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('provider_registration_requests')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch registration requests',
          variant: 'destructive',
        });
        return;
      }

      // Transform the data to include joined fields
      const transformedData = data?.map(request => ({
        ...request,
        category_name: request.categories?.name,
        user_email: request.email // Use the email field directly from the request
      })) || [];

      setRequests(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!canManageRequests) return;

    try {
      setProcessingId(requestId);
      
      const { error } = await supabase
        .from('provider_registration_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving request:', error);
        toast({
          title: 'Error',
          description: 'Failed to approve request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Provider registration request approved successfully',
      });

      // Refresh the requests
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!canManageRequests || !reason.trim()) return;

    try {
      setProcessingId(requestId);
      
      const { error } = await supabase
        .from('provider_registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason.trim(),
          rejected_by: user?.id,
          rejected_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast({
          title: 'Error',
          description: 'Failed to reject request',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Provider registration request rejected',
      });

      // Reset rejection reason and refresh
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canManageRequests) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to manage provider registration requests.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Registration Requests</h2>
          <p className="text-gray-600 mt-1">Review and manage provider registration requests</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {requests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Button onClick={addSampleData} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Export Requests
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Requests List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading requests...</span>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No Registration Requests' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'No provider registration requests have been submitted yet. Use the "Add Sample Data" button above to populate with test data.'
                  : `No requests with ${filter} status found. Try changing the filter or refresh the data.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={fetchRequests} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                {filter !== 'all' && (
                  <Button onClick={() => setFilter('all')} variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Requests
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span>{request.business_name}</span>
                      {getStatusBadge(request.status)}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {request.contact_person}
                      </span>
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {request.user_email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(request.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{request.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">License: {request.license_number}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Category: </span>
                      <span className="text-sm">{request.category_name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Experience: </span>
                      <span className="text-sm">{request.experience_years} years</span>
                    </div>
                    {request.description && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Description: </span>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {(request.license_document_url || request.id_document_url || request.business_registration_url) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.license_document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={request.license_document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            License Document
                          </a>
                        </Button>
                      )}
                      {request.id_document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={request.id_document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            ID Document
                          </a>
                        </Button>
                      )}
                      {request.business_registration_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={request.business_registration_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            Business Registration
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Information */}
                {request.status === 'approved' && request.approved_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Approved on {formatDate(request.approved_at)}
                    </p>
                  </div>
                )}

                {request.status === 'rejected' && request.rejected_at && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800 mb-1">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Rejected on {formatDate(request.rejected_at)}
                    </p>
                    {request.rejection_reason && (
                      <p className="text-sm text-red-700">
                        <strong>Reason:</strong> {request.rejection_reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex space-x-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Registration Request</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this provider registration request for <strong>{request.business_name}</strong>?
                            This will grant them access to register services in the <strong>{request.category_name}</strong> category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleApprove(request.id)}>
                            Approve Request
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={processingId === request.id}
                          onClick={() => setSelectedRequest(request)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Registration Request</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting the registration request from <strong>{request.business_name}</strong>.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                              id="rejection-reason"
                              placeholder="Please explain why this request is being rejected..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="mt-1"
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setRejectionReason('');
                                setSelectedRequest(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => selectedRequest && handleReject(selectedRequest.id, rejectionReason)}
                              disabled={!rejectionReason.trim() || processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Reject Request
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Registration Request Details</DialogTitle>
                          <DialogDescription>
                            Complete information for {request.business_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Business Name</Label>
                              <p className="text-sm text-gray-600">{request.business_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Contact Person</Label>
                              <p className="text-sm text-gray-600">{request.contact_person}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm text-gray-600">{request.user_email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Phone</Label>
                              <p className="text-sm text-gray-600">{request.phone}</p>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm font-medium">Address</Label>
                              <p className="text-sm text-gray-600">{request.address}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Category</Label>
                              <p className="text-sm text-gray-600">{request.category_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Experience</Label>
                              <p className="text-sm text-gray-600">{request.experience_years} years</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">License Number</Label>
                              <p className="text-sm text-gray-600">{request.license_number}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Submitted</Label>
                              <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                            </div>
                          </div>
                          {request.description && (
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};