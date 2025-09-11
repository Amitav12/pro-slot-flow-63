import React from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';

interface AddToCartButtonProps {
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  price: number;
  serviceDetails?: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  serviceId,
  serviceName,
  providerId,
  providerName,
  price,
  serviceDetails,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    await addToCart({
      serviceId,
      serviceName,
      providerId,
      providerName,
      price,
      serviceDetails
    });
  };

  const buttonSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      variant={variant}
      className={`${buttonSizes[size]} ${className} flex items-center gap-2 transition-all duration-200 hover:scale-105`}
    >
      {showIcon && <ShoppingCart className="h-4 w-4" />}
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};