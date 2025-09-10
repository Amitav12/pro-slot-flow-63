import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setVerificationError('No payment session found');
      setIsVerifying(false);
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams, navigate]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('🔍 Verifying payment for session:', sessionId);
      
      const result = await paymentService.verifyPayment(sessionId);
      
      if (result.success) {
        console.log('✅ Payment verified successfully');
        
        // Clear cart after successful payment (both guest and authenticated users)
        await clearCart();
        
        setOrderDetails({
          orderId: result.orderId,
          status: 'paid'
        });
        
        toast({
          title: 'Payment Successful!',
          description: 'Your order has been confirmed and your cart has been cleared.',
          duration: 5000,
        });
      } else {
        console.error('❌ Payment verification failed:', result.error);
        setVerificationError(result.error || 'Payment verification failed');
        
        toast({
          title: 'Payment Verification Failed',
          description: result.error || 'Unable to verify payment status',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('💥 Payment verification error:', error);
      setVerificationError(error.message || 'Unexpected error occurred');
      
      toast({
        title: 'Verification Error',
        description: 'Unable to verify payment. Please contact support.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
            <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (verificationError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Verification Failed</h1>
                <p className="text-gray-600 mb-6">{verificationError}</p>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/orders')} className="w-full">
                    View Orders
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your payment has been processed successfully.
              </p>
              
              {orderDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold mb-2">Order Details:</h3>
                  <p className="text-sm text-gray-600">
                    Order ID: {orderDetails.orderId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {orderDetails.status}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button onClick={() => navigate('/orders')} className="w-full">
                  View Your Orders
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}