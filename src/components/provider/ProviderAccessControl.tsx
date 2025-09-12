import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle, XCircle, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProviderAccessControlProps {
  children: React.ReactNode;
}

export const ProviderAccessControl: React.FC<ProviderAccessControlProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: providerStatus, isLoading } = useQuery({
    queryKey: ['provider-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First check service_providers table for approved providers
      const { data: serviceProvider, error: serviceError } = await supabase
        .from('service_providers')
        .select('status, business_name, created_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (serviceProvider && serviceProvider.status === 'approved') {
        return serviceProvider;
      }
      
      // Then check user_profiles for all provider status including approved ones
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('registration_status, business_name, created_at')
        .eq('user_id', user.id)
        .eq('role', 'provider')
        .maybeSingle();
      
      if (userProfile) {
        // If user profile shows approved and we found a service provider record, return approved
        if (userProfile.registration_status === 'approved' && serviceProvider) {
          return {
            status: 'approved',
            business_name: serviceProvider.business_name || userProfile.business_name,
            created_at: serviceProvider.created_at || userProfile.created_at
          };
        }
        
        return {
          status: userProfile.registration_status || 'pending',
          business_name: userProfile.business_name,
          created_at: userProfile.created_at
        };
      }
      
      return null;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If provider is approved, show the dashboard
  if (providerStatus?.status === 'approved') {
    return <>{children}</>;
  }

  // Show status-specific access control page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {providerStatus?.status === 'pending' && (
                <Clock className="h-16 w-16 text-yellow-500" />
              )}
              {providerStatus?.status === 'rejected' && (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              {!providerStatus && (
                <AlertCircle className="h-16 w-16 text-orange-500" />
              )}
            </div>
            
            <CardTitle className="text-2xl mb-2">
              {providerStatus?.status === 'pending' && 'Account Under Review'}
              {providerStatus?.status === 'rejected' && 'Account Application Rejected'}
              {providerStatus?.status === 'blocked' && 'Account Suspended'}
              {!providerStatus && 'Provider Registration Required'}
            </CardTitle>
            
            <CardDescription className="text-base">
              {providerStatus?.status === 'pending' && 'Your provider application is currently being reviewed by our admin team.'}
              {providerStatus?.status === 'rejected' && 'Your provider application has been rejected. Please contact support for more information.'}
              {providerStatus?.status === 'blocked' && 'Your account has been suspended. Please contact support to resolve this issue.'}
              {!providerStatus && 'You need to complete your provider registration to access the dashboard.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {providerStatus && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Business Name:</span>
                    <p className="font-medium">{providerStatus.business_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Application Date:</span>
                    <p className="font-medium">{new Date(providerStatus.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <Badge 
                      variant={
                        providerStatus.status === 'pending' ? 'secondary' :
                        providerStatus.status === 'approved' ? 'default' : 'destructive'
                      }
                      className="ml-2"
                    >
                      {providerStatus.status.charAt(0).toUpperCase() + providerStatus.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {providerStatus?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Our admin team will review your application and documents</li>
                        <li>• You'll receive an email notification once the review is complete</li>
                        <li>• Typical review time is 1-3 business days</li>
                        <li>• Once approved, you'll have full access to your provider dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {providerStatus?.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Application Rejected</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Your provider application has been rejected. This could be due to incomplete documentation, 
                        verification issues, or not meeting our provider requirements.
                      </p>
                      <p className="text-sm text-red-700">
                        Please contact our support team for detailed feedback and guidance on reapplying.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {providerStatus?.status === 'blocked' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Account Suspended</h4>
                      <p className="text-sm text-red-700">
                        Your provider account has been temporarily suspended. Please contact our support team 
                        to resolve this issue and restore access to your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!providerStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Complete Your Registration</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        To access the provider dashboard, you need to complete your provider registration 
                        with business details and required documentation.
                      </p>
                      <Button asChild>
                        <a href="/provider-registration">
                          Complete Registration
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Support */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Need Help?</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};