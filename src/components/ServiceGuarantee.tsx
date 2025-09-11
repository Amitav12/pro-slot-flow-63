import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw, Award, Clock, CheckCircle, DollarSign, Users, Star } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface Guarantee {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
}

const ServiceGuarantee: React.FC = () => {
  const { data: guaranteeData, isLoading } = useAdminSettings('service_guarantee');
  const { data: siteStats } = useAdminSettings('site_stats');

  if (isLoading) {
    return <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="animate-pulse text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>;
  }

  const getIconComponent = (iconName: string) => {
    const icons = { Shield, RefreshCw, Award, Clock, DollarSign, Users, Star };
    const IconComponent = icons[iconName as keyof typeof icons] || Shield;
    return <IconComponent className="h-8 w-8" />;
  };

  const getColorClass = (index: number) => {
    const colors = ['text-green-600', 'text-blue-600', 'text-purple-600', 'text-orange-600'];
    const bgColors = ['bg-green-50', 'bg-blue-50', 'bg-purple-50', 'bg-orange-50'];
    return { color: colors[index % colors.length], bgColor: bgColors[index % bgColors.length] };
  };

  const guarantees: Guarantee[] = (guaranteeData as any)?.guarantees?.map((guarantee: any, index: number) => {
    const { color, bgColor } = getColorClass(index);
    return {
      id: index + 1,
      icon: getIconComponent(guarantee.icon),
      title: guarantee.title,
      description: guarantee.description,
      details: guarantee.details || [],
      color,
      bgColor
    };
  }) || [];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Our Promise
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {(guaranteeData as any)?.title || 'Service Guarantee'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {(guaranteeData as any)?.subtitle || 'We stand behind every service with comprehensive guarantees for your peace of mind'}
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {guarantees.map((guarantee) => (
            <Card key={guarantee.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 ${guarantee.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 ${guarantee.color}`}>
                  {guarantee.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {guarantee.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm">
                  {guarantee.description}
                </p>

                {/* Details */}
                <ul className="text-xs text-gray-500 space-y-2">
                  {guarantee.details.map((detail, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Guarantee Banner */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white text-green-600 hover:bg-white">
                    100% Guaranteed
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  Your Satisfaction is Our Priority
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  We're so confident in our service quality that we offer multiple guarantees to ensure your complete satisfaction.
                </p>
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Learn More About Our Guarantees
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">30 Days</div>
                  <p className="text-sm opacity-90">Guarantee Period</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">$10K</div>
                  <p className="text-sm opacity-90">Insurance Coverage</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">24/7</div>
                  <p className="text-sm opacity-90">Support Available</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">99.9%</div>
                  <p className="text-sm opacity-90">Uptime Guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
            <p className="text-gray-600 mb-2">Happy Customers</p>
            <p className="text-sm text-gray-500">Served with excellence</p>
          </div>
          
          <div>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
            <p className="text-gray-600 mb-2">Average Rating</p>
            <p className="text-sm text-gray-500">From verified reviews</p>
          </div>
          
          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">&lt; 1%</div>
            <p className="text-gray-600 mb-2">Redo Rate</p>
            <p className="text-sm text-gray-500">Exceptional first-time success</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceGuarantee;