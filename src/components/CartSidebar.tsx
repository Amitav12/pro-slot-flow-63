import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, ShoppingCart, ArrowRight, Diamond } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = React.memo(({ isOpen, onClose }) => {
  const { items, itemCount, totalAmount, updateQuantity, removeFromCart, isLoading } = useCart();

  // Debug only when items change to reduce console spam
  React.useEffect(() => {
    if (isOpen) {
      console.log('CartSidebar: Items updated:', items.length, items);
    }
  }, [items.length, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-background border-l border-border shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-h4 font-bold text-text-primary">Cart</h2>
                  {itemCount > 0 && (
                    <p className="text-small text-text-secondary">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-body font-semibold text-text-primary mb-2">No items in your cart</h3>
                <p className="text-small text-text-secondary mb-6 max-w-sm">
                  Browse our services and add them to your cart to get started.
                </p>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Service NB Link Promise */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Diamond className="h-5 w-5 text-primary" />
                      <h3 className="text-small font-semibold text-primary">Service NB Link Promise</h3>
                    </div>
                    <div className="space-y-2 text-xsmall text-text-secondary">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        <span>4.5+ Rated Professionals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        <span>Quality Assured</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        <span>Specialized Premium Services</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-body font-semibold text-text-primary line-clamp-1 mb-1">
                              {item.serviceName}
                            </h4>
                            {item.providerName && (
                              <p className="text-small text-text-secondary mb-2">
                                by {item.providerName}
                              </p>
                            )}
                            <div className="text-body font-bold text-primary">
                              ₹{item.price.toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-surface rounded-lg transition-colors ml-2"
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 text-text-muted" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-body font-medium text-text-primary w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isLoading}
                              className="w-8 h-8 border border-primary text-primary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <Badge variant="outline" className="text-xsmall">
                            Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Save 10% Offer */}
                <Card className="border-warning/20 bg-warning/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                        <Diamond className="h-4 w-4 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-small font-semibold text-warning mb-1">
                          Save 10% on every order
                        </h3>
                        <p className="text-xsmall text-text-secondary">Get Plus now</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-warning border-warning">
                        View More Offers
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {items.length > 0 && (
            <div className="border-t border-border bg-surface/50 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body font-semibold text-text-primary">Total</span>
                  <span className="text-h4 font-bold text-primary">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground py-3 text-body font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `View Cart • ₹${totalAmount.toLocaleString()}`}
                </Button>
                
                <p className="text-xsmall text-text-muted text-center">
                  Secure checkout with 256-bit SSL encryption
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});