import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Users, Clock, Award, Lock } from 'lucide-react';

interface SafetyFeature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const SafetyBadges: React.FC = () => {
  const safetyFeatures: SafetyFeature[] = [
    {
      id: 1,
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Background Verified",
      description: "All professionals undergo thorough background checks and identity verification",
      badge: "100% Verified"
    },
    {
      id: 2,
      icon: <CheckCircle className="h-8 w-8 text-blue-600" />,
      title: "Insured Services",
      description: "Comprehensive insurance coverage for all services and potential damages",
      badge: "Fully Insured"
    },
    {
      id: 3,
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Trained Professionals",
      description: "Certified experts with proven skills and continuous training programs",
      badge: "Certified"
    },
    {
      id: 4,
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Real-time Tracking",
      description: "Live location tracking and updates throughout the service duration",
      badge: "Live Tracking"
    },
    {
      id: 5,
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      title: "Quality Guarantee",
      description: "Money-back guarantee if you're not satisfied with the service quality",
      badge: "Guaranteed"
    },
    {
      id: 6,
      icon: <Lock className="h-8 w-8 text-red-600" />,
      title: "Secure Payments",
      description: "Bank-grade encryption and secure payment processing for all transactions",
      badge: "SSL Secured"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Safety First
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We maintain the highest standards of safety and security for every service
          </p>
        </div>

        {/* Safety Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {safetyFeatures.map((feature) => (
            <Card key={feature.id} className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="p-3 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Badge */}
                {feature.badge && (
                  <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-100">
                    {feature.badge}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Certifications */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trusted & Certified
            </h3>
            <p className="text-gray-600">
              Recognized by leading industry organizations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {/* Certification Badges */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">ISO Certified</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Quality Assured</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Data Protected</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Verified Platform</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyBadges;