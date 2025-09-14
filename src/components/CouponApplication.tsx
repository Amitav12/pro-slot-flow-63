import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Gift, Tag, X, Check, AlertCircle } from 'lucide-react';

interface SpecialOffer {
  id: string;
  title: string;
  description: string | null;
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number | null;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  offerId: string;
}

interface CouponApplicationProps {
  subtotal: number;
  onCouponApplied: (coupon: AppliedCoupon | null) => void;
  appliedCoupon: AppliedCoupon | null;
}

export const CouponApplication: React.FC<CouponApplicationProps> = ({
  subtotal,
  onCouponApplied,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [availableOffers, setAvailableOffers] = useState<SpecialOffer[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadAvailableOffers();
  }, []);

  const loadAvailableOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .order('discount_value', { ascending: false });

      if (error) throw error;
      setAvailableOffers(data || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const validateAndApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a coupon code.',
        variant: 'destructive',
      });
      return;
    }

    setIsApplying(true);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('validate_coupon_code', {
        coupon_code: code.toUpperCase(),
        customer_id: session.user.id,
        order_amount: subtotal
      });

      if (error) throw error;

      const result = data;
      
      if (result.is_valid) {
        const appliedCouponData: AppliedCoupon = {
          code: code.toUpperCase(),
          discountAmount: result.discount_amount,
          offerId: code.toUpperCase()
        };
        
        onCouponApplied(appliedCouponData);
        setCouponCode('');
        
        toast({
          title: 'Coupon Applied!',
          description: `You saved $${result.discount_amount.toFixed(2)}`,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: result.error_message || 'Invalid coupon code',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply coupon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    onCouponApplied(null);
    toast({
      title: 'Coupon Removed',
      description: 'The coupon has been removed from your order.',
    });
  };

  const applyOfferCode = (code: string) => {
    setCouponCode(code);
    validateAndApplyCoupon(code);
  };

  const getDiscountText = (offer: SpecialOffer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% OFF`;
    } else {
      return `$${offer.discount_value} OFF`;
    }
  };

  const isOfferApplicable = (offer: SpecialOffer) => {
    return subtotal >= (offer.minimum_order_amount || 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Coupons & Offers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">
                    Coupon Applied: {appliedCoupon.code}
                  </p>
                  <p className="text-sm text-green-600">
                    You saved ${appliedCoupon.discountAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Coupon Code Input */}
        {!appliedCoupon && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    validateAndApplyCoupon(couponCode);
                  }
                }}
              />
              <Button
                onClick={() => validateAndApplyCoupon(couponCode)}
                disabled={isApplying || !couponCode.trim()}
                className="px-6"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </Button>
            </div>

            {/* Toggle Available Offers */}
            <Button
              variant="outline"
              onClick={() => setShowOffers(!showOffers)}
              className="w-full text-primary border-primary/20 hover:bg-primary/5"
            >
              <Tag className="h-4 w-4 mr-2" />
              {showOffers ? 'Hide' : 'View'} Available Offers ({availableOffers.length})
            </Button>
          </div>
        )}

        {/* Available Offers */}
        {showOffers && !appliedCoupon && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Available Offers
            </h4>
            {availableOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No offers available at the moment.
              </p>
            ) : (
              <div className="space-y-2">
                {availableOffers.map((offer) => {
                  const applicable = isOfferApplicable(offer);
                  return (
                    <div
                      key={offer.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        applicable
                          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={applicable ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {getDiscountText(offer)}
                            </Badge>
                            <span className="font-semibold text-sm">{offer.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {offer.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Code: {offer.code}</span>
                            {(offer.minimum_order_amount || 0) > 0 && (
                              <span>Min: ${offer.minimum_order_amount}</span>
                            )}
                            <span>
                              Expires: {new Date(offer.valid_until).toLocaleDateString()}
                            </span>
                          </div>
                          {!applicable && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>
                                Minimum order of ${offer.minimum_order_amount} required
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applyOfferCode(offer.code)}
                          disabled={!applicable || isApplying}
                          className="ml-3"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};