import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, User, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalServiceCardProps {
  service: {
    id: string;
    service_name: string;
    description?: string;
    price: number;
    duration?: number;
    provider_id?: string; // Ensure we have the provider UUID
    service_providers?: {
      business_name?: string;
      rating?: number;
      total_reviews?: number;
    };
    user_profile?: {
      full_name?: string;
      business_name?: string;
    };
    subcategories?: {
      name: string;
    };
  };
  onBook?: (service: any) => void;
}

export const ProfessionalServiceCard: React.FC<ProfessionalServiceCardProps> = ({ 
  service,
  onBook 
}) => {
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      await addToCart({
        serviceId: service.id,
        serviceName: service.service_name,
        providerId: service.provider_id || undefined,
        providerName: service.service_providers?.business_name || service.user_profile?.business_name || 'Professional Service',
        price: service.price,
        serviceDetails: {
          duration: service.duration || 60,
          category: service.subcategories?.name
        }
      });

      console.log('ProfessionalServiceCard: Added to cart successfully');
    } catch (error) {
      console.error('ProfessionalServiceCard: Error adding to cart:', error);
    }
  };

  const handleBookNow = () => {
    if (onBook) {
      onBook(service);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 overflow-hidden">
      <CardContent className="p-0">
        {/* Service Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-h4 font-bold text-text-primary line-clamp-1">
                    {service.service_name}
                  </h3>
                  <p className="text-small text-text-secondary">
                    {service.service_providers?.business_name || service.user_profile?.business_name || 'Professional Service'}
                  </p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-small font-medium text-text-primary">
                    {service.service_providers?.rating || 4.5}
                  </span>
                </div>
                <span className="text-xsmall text-text-muted">
                  ({service.service_providers?.total_reviews || 0} reviews)
                </span>
                <Badge variant="outline" className="border-success text-success bg-success/10">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-h3 font-bold text-primary">₹{service.price}</div>
              <div className="text-xsmall text-text-muted">Starting price</div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2 text-text-secondary">
              <Clock className="h-4 w-4" />
              <span className="text-small">{service.duration || 60} mins</span>
            </div>
            {service.subcategories?.name && (
              <Badge variant="outline" className="text-xsmall">
                {service.subcategories.name}
              </Badge>
            )}
          </div>
          
          {service.description && (
            <p className="text-small text-text-secondary line-clamp-2 mb-6">
              {service.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isLoading ? 'Adding...' : 'Add to Cart'}</span>
            </Button>
            
            <Button
              onClick={handleBookNow}
              className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground font-semibold"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Service NB Link Promise */}
        <div className="bg-gradient-to-r from-success/5 to-success/10 border-t border-success/20 p-4">
          <div className="flex items-center justify-center space-x-4 text-xsmall text-success">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
              <span>Quality Assured</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
              <span>Professional Service</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};