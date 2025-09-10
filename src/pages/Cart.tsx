import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';


export default function Cart() {
  const { items, itemCount, totalAmount, removeFromCart, updateQuantity, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dynamic service fee calculation (could be 0, percentage, or fixed amount)
  const serviceFee = totalAmount > 0 ? Math.max(totalAmount * 0.05, 2) : 0; // 5% with minimum $2
  const finalTotal = totalAmount + serviceFee;

  const handleCheckout = async () => {
    console.log('🚀 Starting checkout process...', { 
      totalAmount, 
      serviceFee, 
      finalTotal, 
      itemCount, 
      items,
      isAuthenticated 
    });

    // Allow checkout even for non-authenticated users (guest checkout)
    if (!isAuthenticated) {
      console.log('🔄 Proceeding with guest checkout...');
    }

    // Ensure we have items to checkout
    if (itemCount === 0 || items.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await paymentService.createCheckoutSession({
        amount: Math.round(finalTotal * 100), // Convert to cents
        currency: 'usd',
        cartItems: items,
        metadata: { 
          source: 'cart',
          isAuthenticated: isAuthenticated.toString(),
          serviceFee: serviceFee.toFixed(2)
        },
      });

      console.log('💳 Checkout session result:', result);

      if (result.success && result.url) {
        console.log('✅ Redirecting to Stripe checkout:', result.url);
        // Open Stripe checkout in the same window
        window.location.href = result.url;
      } else {
        console.error('❌ Checkout failed:', result.error);
        toast({
          title: 'Checkout Failed',
          description: result.error || 'Unable to start checkout. Please try again.',
          variant: 'destructive',
          duration: 10000,
        });
      }
    } catch (err: any) {
      console.error('💥 Checkout error:', err);
      toast({
        title: 'Payment System Error',
        description: `Error: ${err.message || 'Unexpected error occurred'}`,
        variant: 'destructive',
        duration: 15000,
      });
    }
  };

  if (itemCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any services to your cart yet. Browse our services and add some!
            </p>
            <Button onClick={() => navigate('/')} className="btn-primary">
              Browse Services
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {itemCount} {itemCount === 1 ? 'service' : 'services'} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="card-premium">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.serviceName}
                        </h3>
                        {item.providerName && (
                          <p className="text-gray-600 mb-2">
                            Provider: {item.providerName}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-primary">
                            ${item.price}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  Clear Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="card-premium sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    disabled={isLoading || itemCount === 0}
                    className="w-full btn-primary mt-6"
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    <div className="flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" />
                      Secure payment powered by Stripe
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}