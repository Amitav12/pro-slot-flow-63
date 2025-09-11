import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { ShoppingCart, Plus, Minus, Trash2, Calendar, Clock, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface EnhancedCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export const EnhancedCartSidebar: React.FC<EnhancedCartSidebarProps> = ({
  isOpen,
  onClose,
  onProceedToPayment
}) => {
  const { items, updateQuantity, removeFromCart, totalAmount, itemCount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Your Cart ({itemCount})</span>
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground text-sm">
                Add some services to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={`${item.serviceId}-${item.providerId}`} className="relative">
                  <CardContent className="p-4">
                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    <div className="space-y-3">
                      {/* Service Info */}
                      <div>
                        <h4 className="font-semibold text-foreground line-clamp-2">
                          {item.serviceName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          by {item.providerName}
                        </p>
                      </div>

                      {/* Service Details */}
                      {item.serviceDetails && (
                        <div className="flex flex-wrap gap-2">
                          {item.serviceDetails.duration_minutes && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.serviceDetails.duration_minutes} min
                            </Badge>
                          )}
                          {item.serviceDetails.selectedDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.serviceDetails.selectedDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {item.serviceDetails.selectedTime && (
                            <Badge variant="outline" className="text-xs">
                              {item.serviceDetails.selectedTime}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(item.price)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      {item.quantity > 1 && (
                        <div className="text-right text-sm text-muted-foreground">
                          Subtotal: {formatPrice(item.price * item.quantity)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">              
              <PaymentButton 
                className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary"
              />
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Service Promise */}
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="text-sm text-center">
                <p className="font-medium text-primary mb-1">🔒 Secure Booking</p>
                <p className="text-muted-foreground text-xs">
                  All payments are secure. 100% satisfaction guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};