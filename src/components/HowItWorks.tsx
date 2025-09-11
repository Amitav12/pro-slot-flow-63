import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, UserCheck, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useNavigate } from 'react-router-dom';

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
}

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  // Hard-coded 5-step process - not configurable by admin
  const steps: Step[] = [
    {
      id: 1,
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Select",
      description: "Choose from hundreds of verified services",
      details: [
        "Browse service categories",
        "Compare prices & reviews", 
        "Select your preferred service"
      ],
      color: "text-blue-600"
    },
    {
      id: 2,
      icon: <Calendar className="h-8 w-8" />,
      title: "Book & Schedule", 
      description: "Pick your convenient date and time",
      details: [
        "Choose available time slots",
        "Add service location",
        "Specify requirements"
      ],
      color: "text-green-600"
    },
    {
      id: 3,
      icon: <CreditCard className="h-8 w-8" />,
      title: "Secure Payment",
      description: "Pay safely after service completion", 
      details: [
        "Multiple payment options",
        "Secure transactions",
        "Digital receipts"
      ],
      color: "text-pink-600"
    },
    {
      id: 4,
      icon: <UserCheck className="h-8 w-8" />,
      title: "Professional Arrives",
      description: "Verified expert comes to your location",
      details: [
        "Real-time tracking",
        "Professional introduction", 
        "Service begins on time"
      ],
      color: "text-purple-600"
    },
    {
      id: 5,
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Service Complete",
      description: "Quality work delivered with satisfaction",
      details: [
        "Service completion",
        "Quality inspection",
        "Rate & review"
      ],
      color: "text-orange-600"
    }
  ];


  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get professional services in just 5 simple steps. It's that easy!
          </p>
        </div>

        {/* Desktop Steps Flow */}
        <div className="hidden lg:block mb-16">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 via-orange-200 to-pink-200 z-0"></div>
            
            <div className="grid grid-cols-5 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div key={step.id} className="text-center">
                  {/* Step Circle */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center ${step.color} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number */}
                  <div className="w-8 h-8 mx-auto mb-3 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.id}
                  </div>
                  
                  {/* Step Content */}
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>
                  
                  {/* Step Details */}
                  <ul className="text-xs text-gray-500 space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Steps */}
        <div className="lg:hidden space-y-6 mb-12">
          {steps.map((step, index) => (
            <div key={step.id}>
              <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Icon & Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center ${step.color} mb-2`}>
                        {step.icon}
                      </div>
                      <div className="w-6 h-6 mx-auto bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {step.id}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {step.description}
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join thousands of satisfied customers who trust us for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 transition-all duration-300 ease-out transform hover:scale-105"
              variant="outline"
              onClick={() => {
                console.log('Book Your First Service clicked - navigating to /all-categories');
                try {
                  navigate('/all-categories');
                } catch (error) {
                  console.error('Navigation failed, using fallback:', error);
                  window.location.href = '/all-categories';
                }
              }}
            >
              Book Your First Service
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">5 Min</div>
            <p className="text-gray-600 text-sm">Average Booking Time</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Same Day</div>
            <p className="text-gray-600 text-sm">Service Availability</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">24/7</div>
            <p className="text-gray-600 text-sm">Customer Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">100%</div>
            <p className="text-gray-600 text-sm">Satisfaction Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;