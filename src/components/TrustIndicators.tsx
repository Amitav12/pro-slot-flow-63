import React from 'react';
import { Shield, DollarSign, Award, Users, Clock, Star } from 'lucide-react';

const TrustIndicators = () => {
  const indicators = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'Background checked & ID verified',
      stat: '100%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden charges, upfront costs',
      stat: '₹0',
      statLabel: 'Hidden fees',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: '30-day service warranty',
      stat: '4.8★',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      icon: Users,
      title: 'Trusted by Millions',
      description: 'Over 5M+ happy customers',
      stat: '5M+',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    },
    {
      icon: Clock,
      title: 'On-Time Service',
      description: 'Punctual & reliable professionals',
      stat: '95%',
      statLabel: 'On-time rate',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100'
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'Curated services for your home',
      stat: '4.9★',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why choose Service NB Link?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing you with the best home service experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((indicator, index) => {
            const IconComponent = indicator.icon;
            
            return (
              <div
                key={index}
                className={`${indicator.bgColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${indicator.iconBg} p-3 rounded-xl flex-shrink-0`}>
                    <IconComponent className={`h-6 w-6 ${indicator.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {indicator.title}
                      </h3>
                      <span className={`font-bold text-xl ${indicator.color}`}>
                        {indicator.stat}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {indicator.description}
                    </p>
                    
                    {indicator.statLabel && (
                      <p className="text-xs text-gray-500 mt-1">
                        {indicator.statLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">ISO Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Best Service Award 2024</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Trusted Partner</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Top Rated Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;