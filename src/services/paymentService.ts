import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

interface PaymentResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

interface CreateCheckoutRequest {
  amount: number;
  currency?: string;
  cartItems: CartItem[];
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions?: string;
  };
  metadata?: Record<string, string>;
}

export class PaymentService {
  /**
   * Create a Stripe Checkout session for one-time payments
   */
  async createCheckoutSession(request: CreateCheckoutRequest): Promise<PaymentResult & { url?: string }> {
    try {
      console.log('🔄 Creating checkout session...', request);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: request.amount,
          currency: request.currency || 'usd',
          cartItems: request.cartItems,
          guestInfo: request.guestInfo,
          metadata: request.metadata || {},
        },
      });

      if (error) {
        console.error('❌ Checkout session error:', error);
        return {
          success: false,
          error: error.message || 'Failed to create checkout session',
        };
      }

      if (data?.url) {
        console.log('✅ Checkout session created:', data.url);
        return {
          success: true,
          url: data.url,
        };
      }

      return {
        success: false,
        error: 'No checkout URL received',
      };
    } catch (error: any) {
      console.error('💥 Payment service error:', error);
      return {
        success: false,
        error: error.message || 'Unexpected error occurred',
      };
    }
  }

  /**
   * Verify payment status after checkout
   */
  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      console.log('🔍 Verifying payment for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });

      if (error) {
        console.error('❌ Payment verification error:', error);
        return {
          success: false,
          error: error.message || 'Failed to verify payment',
        };
      }

      console.log('✅ Payment verification result:', data);
      return {
        success: data?.success || false,
        orderId: data?.orderId,
        error: data?.error,
      };
    } catch (error: any) {
      console.error('💥 Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Unexpected error occurred',
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;