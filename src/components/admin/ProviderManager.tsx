
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  UserCheck, 
  UserX,
  Award,
  Phone,
  Mail,
  MapPin,
  Search,
  FileText,
  Download,
  AlertCircle,
  Trash2,
  Edit2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  license_number?: string;
  license_document_url?: string;
  id_document_url?: string;
  status: string;
  is_featured: boolean;
  is_emergency_offline: boolean;
  rating: number;
  total_reviews: number;
  total_completed_jobs: number;
  response_time_minutes: number;
  created_at: string;
}

interface ProviderDocument {
  id: string;
  provider_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  verification_status: string;
  verification_notes?: string;
  uploaded_at: string;
}

export const ProviderManager = () => {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerDocuments, setProviderDocuments] = useState<ProviderDocument[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch from user_profiles for pending providers and service_providers for approved ones
  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      // Get approved providers from service_providers table
      const { data: approvedProviders, error: approvedError } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (approvedError) throw approvedError;

      // Get pending providers from user_profiles table
      const { data: pendingProviders, error: pendingError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'provider')
        .eq('registration_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (pendingError) throw pendingError;

      // Convert user_profiles to provider format for pending providers
      const formattedPendingProviders = pendingProviders?.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        business_name: profile.business_name || 'N/A',
        contact_person: profile.contact_person || profile.full_name || 'N/A',
        phone: profile.phone || 'N/A',
        email: 'N/A', // Email is in auth.users, not accessible here
        address: profile.address || 'N/A',
        license_number: profile.license_number,
        license_document_url: profile.license_document_url,
        id_document_url: profile.id_document_url,
        status: 'pending',
        is_featured: false,
        is_emergency_offline: false,
        rating: 0,
        total_reviews: 0,
        total_completed_jobs: 0,
        response_time_minutes: 15,
        created_at: profile.created_at
      })) || [];
      
      return [...formattedPendingProviders, ...(approvedProviders || [])] as ServiceProvider[];
    }
  });

  // Real-time subscription for providers
  useEffect(() => {
    const userProfilesChannel = supabase
      .channel('provider-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: 'role=eq.provider'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
        }
      )
      .subscribe();

    const serviceProvidersChannel = supabase
      .channel('service-providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_providers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userProfilesChannel);
      supabase.removeChannel(serviceProvidersChannel);
    };
  }, [queryClient]);

  // Fetch provider documents when viewing details
  const fetchProviderDocuments = async (providerId: string) => {
    const { data, error } = await supabase
      .from('service_provider_documents')
      .select('*')
      .eq('provider_id', providerId)
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    return data as ProviderDocument[];
  };

  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceProvider> }) => {
      const { data, error } = await (supabase as any)
        .from('service_providers')
        .update(updates as any)
        .eq('id' as any, id as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast({ title: 'Success', description: 'Provider updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to update provider',
        variant: 'destructive'
      });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast({ title: 'Success', description: 'Provider deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete provider',
        variant: 'destructive'
      });
    }
  });

  const handleStatusChange = async (providerId: string, newStatus: string) => {
    try {
      if (newStatus === 'approved') {
        // Use the approve_provider function for pending providers
        const provider = providers?.find(p => p.id === providerId);
        if (provider && provider.status === 'pending') {
          const { data, error } = await supabase.rpc('approve_provider', {
            provider_user_id: provider.user_id
          });
          
          if (error) throw error;
          
          queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
          toast({ 
            title: 'Success', 
            description: 'Provider approved and moved to service providers' 
          });
          return;
        }
      } else if (newStatus === 'rejected') {
        // Use the reject_provider function for pending providers
        const provider = providers?.find(p => p.id === providerId);
        if (provider && provider.status === 'pending') {
          const { data, error } = await supabase.rpc('reject_provider', {
            provider_user_id: provider.user_id
          });
          
          if (error) throw error;
          
          queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
          toast({ 
            title: 'Success', 
            description: 'Provider registration rejected' 
          });
          return;
        }
      }

      // For existing service providers, update directly
      updateProviderMutation.mutate({
        id: providerId,
        updates: { status: newStatus }
      });
    } catch (error) {
      console.error('Error changing provider status:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update provider status',
        variant: 'destructive'
      });
    }
  };

  const handleViewProvider = async (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    const documents = await fetchProviderDocuments(provider.id);
    setProviderDocuments(documents);
  };

  const handleDeleteProvider = (providerId: string) => {
    deleteProviderMutation.mutate(providerId);
  };

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = !searchTerm || 
      provider.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.email && provider.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const pendingProviders = filteredProviders.filter(p => p.status === 'pending');

  const handleFeaturedToggle = (providerId: string, isFeatured: boolean) => {
    updateProviderMutation.mutate({
      id: providerId,
      updates: { is_featured: isFeatured }
    });
  };

  const handleEmergencyOfflineToggle = (providerId: string, isOffline: boolean) => {
    updateProviderMutation.mutate({
      id: providerId,
      updates: { is_emergency_offline: isOffline }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <p className="text-gray-600">Approve, manage, and monitor service providers</p>
          {pendingProviders.length > 0 && (
            <div className="flex items-center mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm font-medium">
                {pendingProviders.length} provider{pendingProviders.length !== 1 ? 's' : ''} pending approval
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Data
          </Button>
          <Button>
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search providers by name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Providers', 
            value: filteredProviders?.length || 0, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Pending Approval', 
            value: filteredProviders?.filter(p => p.status === 'pending').length || 0, 
            color: 'text-yellow-600' 
          },
          { 
            title: 'Approved', 
            value: filteredProviders?.filter(p => p.status === 'approved').length || 0, 
            color: 'text-green-600' 
          },
          { 
            title: 'Featured', 
            value: filteredProviders?.filter(p => p.is_featured).length || 0, 
            color: 'text-purple-600' 
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-sm ${stat.color}`}>{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {filteredProviders?.map((provider) => (
          <Card key={provider.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Provider Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">
                        {provider.business_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{provider.business_name}</h3>
                      <p className="text-gray-600">{provider.contact_person}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-gray-500 text-sm">({provider.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-3 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{provider.address}</span>
                  </div>
                </div>

                {/* Status & Stats */}
                <div className="lg:col-span-2">
                  <Badge className={`mb-2 ${getStatusColor(provider.status)}`}>
                    {provider.status.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div>{provider.total_completed_jobs} jobs completed</div>
                    <div>~{provider.response_time_minutes}min response</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="lg:col-span-3 flex flex-col space-y-3">
                  {provider.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(provider.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(provider.id, 'rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`featured-${provider.id}`}
                        checked={provider.is_featured}
                        onCheckedChange={(checked) => handleFeaturedToggle(provider.id, checked)}
                      />
                      <Label htmlFor={`featured-${provider.id}`} className="text-sm">
                        <Award className="w-4 h-4 inline mr-1" />
                        Featured
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`offline-${provider.id}`}
                        checked={provider.is_emergency_offline}
                        onCheckedChange={(checked) => handleEmergencyOfflineToggle(provider.id, checked)}
                      />
                      <Label htmlFor={`offline-${provider.id}`} className="text-sm">
                        Emergency Offline
                      </Label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProvider(provider)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {provider.status === 'approved' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(provider.id, 'blocked')}
                        className="border-red-300 text-red-600"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    ) : provider.status === 'blocked' ? (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(provider.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unblock
                      </Button>
                    ) : null}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the provider account and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Provider
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Provider Details Modal */}
      {selectedProvider && (
        <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Provider Details - {selectedProvider.business_name}</span>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedProvider.status)}>
                    {selectedProvider.status.toUpperCase()}
                  </Badge>
                  {selectedProvider.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          handleStatusChange(selectedProvider.id, 'approved');
                          setSelectedProvider(null);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedProvider.id, 'rejected');
                          setSelectedProvider(null);
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <DialogContent className="space-y-6">
              {/* Provider Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-sm text-gray-600">Business Name</Label>
                      <p className="font-medium">{selectedProvider.business_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Contact Person</Label>
                      <p className="font-medium">{selectedProvider.contact_person}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Phone</Label>
                      <p className="font-medium">{selectedProvider.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Email</Label>
                      <p className="font-medium">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Address</Label>
                      <p className="font-medium">{selectedProvider.address}</p>
                    </div>
                    {selectedProvider.license_number && (
                      <div>
                        <Label className="text-sm text-gray-600">License Number</Label>
                        <p className="font-medium">{selectedProvider.license_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-sm text-gray-600">Rating</Label>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{selectedProvider.rating}</span>
                        <span className="text-gray-500 ml-1">({selectedProvider.total_reviews} reviews)</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Completed Jobs</Label>
                      <p className="font-medium">{selectedProvider.total_completed_jobs}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Response Time</Label>
                      <p className="font-medium">~{selectedProvider.response_time_minutes} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Member Since</Label>
                      <p className="font-medium">{new Date(selectedProvider.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Featured Provider</Label>
                      <Badge variant={selectedProvider.is_featured ? "default" : "secondary"}>
                        {selectedProvider.is_featured ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Documents Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
                {providerDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {providerDocuments.map((doc) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <FileText className="w-5 h-5 text-blue-500 mt-1" />
                            <div>
                              <p className="font-medium">{doc.document_name}</p>
                              <p className="text-sm text-gray-600 capitalize">{doc.document_type.replace('_', ' ')}</p>
                              <Badge 
                                variant={
                                  doc.verification_status === 'verified' ? 'default' :
                                  doc.verification_status === 'rejected' ? 'destructive' : 'secondary'
                                }
                                className="mt-1"
                              >
                                {doc.verification_status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                              {doc.verification_notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {doc.verification_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}

                {/* Legacy document URLs */}
                {(selectedProvider.license_document_url || selectedProvider.id_document_url) && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Legacy Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProvider.license_document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedProvider.license_document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            License Document
                          </a>
                        </Button>
                      )}
                      {selectedProvider.id_document_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedProvider.id_document_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            ID Document
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
