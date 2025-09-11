import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, Clock, Star, Copy, Check } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface Offer {
  id: number;
  type: 'discount' | 'cashback' | 'free' | 'bundle';
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil: string;
  minOrder?: string;
  category?: string;
  isPopular?: boolean;
  gradient: string;
}

const PromotionalOffers: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { data: promoData, isLoading } = useAdminSettings('promotional_offers');

  if (isLoading) {
    return <section className="py-16 bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="container mx-auto px-6">
        <div className="animate-pulse text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>;
  }

  const offers: Offer[] = (promoData as any)?.offers?.map((offer: any, index: number) => ({
    id: index + 1,
    type: 'discount',
    title: offer.title,
    description: offer.description,
    code: offer.code,
    discount: offer.discount,
    validUntil: offer.expires,
    isPopular: index === 0,
    gradient: index % 4 === 0 ? 'from-purple-500 to-pink-500' : 
              index % 4 === 1 ? 'from-blue-500 to-cyan-500' :
              index % 4 === 2 ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-red-500'
  })) || [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="h-5 w-5" />;
      case 'cashback':
        return <Gift className="h-5 w-5" />;
      case 'free':
        return <Star className="h-5 w-5" />;
      case 'bundle':
        return <Gift className="h-5 w-5" />;
      default:
        return <Percent className="h-5 w-5" />;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
            <Gift className="h-4 w-4 mr-2" />
            {(promoData as any)?.subtitle || 'Special Offers'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {(promoData as any)?.title || 'Exclusive Deals & Offers'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Save more with our limited-time promotional offers and seasonal discounts
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${offer.gradient} p-4 text-white relative`}>
                {offer.isPopular && (
                  <Badge className="absolute top-2 right-2 bg-white text-gray-900 text-xs">
                    Most Popular
                  </Badge>
                )}
                <div className="flex items-center mb-2">
                  {getTypeIcon(offer.type)}
                  <span className="ml-2 text-sm font-medium opacity-90">
                    {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">{offer.discount}</div>
                {offer.category && (
                  <div className="text-sm opacity-90">{offer.category}</div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Offer Details */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {offer.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {offer.description}
                </p>

                {/* Code Section */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Promo Code</p>
                      <p className="font-mono font-bold text-gray-900">
                        {offer.code}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(offer.code)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Valid until {offer.validUntil}
                  </div>
                  {offer.minOrder && (
                    <div>Min. order: {offer.minOrder}</div>
                  )}
                </div>

                {/* CTA Button */}
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flash Sale Banner */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4">
              <Clock className="h-4 w-4 mr-2" />
              Flash Sale - Limited Time
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">
              Up to 70% OFF on Selected Services
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Hurry! Offer ends in 2 days. Book your favorite services now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-red-500 hover:bg-gray-100">
                Explore Flash Sale
              </Button>
              <div className="text-sm opacity-90">
                Use code: <span className="font-mono font-bold">FLASH70</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalOffers;