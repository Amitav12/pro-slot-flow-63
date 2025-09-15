import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SimpleProviderRegistration } from './SimpleProviderRegistration';
import { SubcategoryPricingSetup } from './SubcategoryPricingSetup';

type RegistrationView = 'initial' | 'pricing' | 'completed';

interface ProviderRegistrationStatus {
  hasApprovedRegistrations: boolean;
  hasPendingRegistrations: boolean;
  registrations: Array<{
    id: string;
    category_name: string;
    status: string;
    created_at: string;
  }>;
}

export const ServiceRegistration = () => {
  const [currentView, setCurrentView] = useState<RegistrationView>('initial');
  const [registrationStatus, setRegistrationStatus] = useState<ProviderRegistrationStatus>({
    hasApprovedRegistrations: false,
    hasPendingRegistrations: false,
    registrations: []
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  // Check provider's registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('provider_registration_requests')
          .select(`
            id,
            status,
            created_at,
            categories!inner(
              name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const registrations = data?.map(item => ({
          id: item.id,
          category_name: item.categories?.name || 'Unknown Category',
          status: item.status,
          created_at: item.created_at
        })) || [];

        const hasApproved = registrations.some(reg => reg.status === 'approved');
        const hasPending = registrations.some(reg => reg.status === 'pending');

        setRegistrationStatus({
          hasApprovedRegistrations: hasApproved,
          hasPendingRegistrations: hasPending,
          registrations
        });

        // Determine initial view
        if (hasApproved) {
          setCurrentView('pricing');
        } else {
          setCurrentView('initial');
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        toast({
          title: "Error",
          description: "Failed to load registration status.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [user]);

  const renderRegistrationStatus = () => {
    if (registrationStatus.registrations.length === 0) {
      return null;
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Registration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {registrationStatus.registrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{registration.category_name}</p>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(registration.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {registration.status === 'approved' && (
                     <Badge className="bg-green-100 text-green-800">
                       <CheckCircle className="w-3 h-3 mr-1" />
                       Approved
                     </Badge>
                   )}
                  {registration.status === 'pending' && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Loader2 className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {registration.status === 'rejected' && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };



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
          <h1 className="text-3xl font-bold">Service Registration</h1>
          <p className="text-gray-600">Manage your service provider registration and offerings</p>
        </div>
      </div>

      {renderRegistrationStatus()}

      {/* Initial Registration View */}
      {currentView === 'initial' && (
        <div className="space-y-6">
          {!registrationStatus.hasPendingRegistrations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Become a Service Provider</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  To start offering services on our platform, you need to register as a provider first.
                  This involves submitting your professional credentials for verification.
                </p>
                <SimpleProviderRegistration />
              </CardContent>
            </Card>
          )}

          {registrationStatus.hasPendingRegistrations && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-spin" />
                <h3 className="text-lg font-medium mb-2">Registration Under Review</h3>
                <p className="text-gray-600 mb-4">
                  Your provider registration is currently being reviewed by our admin team.
                  You'll be able to set up your services once your registration is approved.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">What's next?</span> We'll review your credentials and notify you via email once approved.
                    This process typically takes 1-2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pricing Setup View */}
      {currentView === 'pricing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Set Up Your Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Congratulations!</span> Your provider registration has been approved.
                  You can now set up your service offerings and pricing.
                </p>
              </div>
              <SubcategoryPricingSetup />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed View */}
      {currentView === 'completed' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">Setup Complete!</h3>
              <p className="text-gray-600 mb-4">
                Your services have been set up successfully. You can now start receiving bookings from customers.
              </p>
              <Button onClick={() => window.location.href = '/provider/dashboard'}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};