import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, Zap, AlertTriangle, Wrench, Droplets, Flame, Shield } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface EmergencyService {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  responseTime: string;
  availability: string;
  phoneNumber: string;
  isActive: boolean;
}

const EmergencyServices: React.FC = () => {
  const { data: emergencySettings } = useAdminSettings('emergency_services');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const emergencyServices: EmergencyService[] = [
    {
      id: 1,
      icon: <Droplets className="h-6 w-6" />,
      title: "Plumbing Emergency",
      description: "Burst pipes, leaks, blockages",
      responseTime: "15-30 min",
      availability: "24/7",
      phoneNumber: "+1-800-PLUMBER",
      isActive: true
    },
    {
      id: 2,
      icon: <Zap className="h-6 w-6" />,
      title: "Electrical Emergency",
      description: "Power outages, short circuits",
      responseTime: "20-45 min",
      availability: "24/7",
      phoneNumber: "+1-800-ELECTRIC",
      isActive: true
    },
    {
      id: 3,
      icon: <Wrench className="h-6 w-6" />,
      title: "AC/Heating Emergency",
      description: "System breakdown, no cooling/heating",
      responseTime: "30-60 min",
      availability: "24/7",
      phoneNumber: "+1-800-HVAC",
      isActive: true
    },
    {
      id: 4,
      icon: <Shield className="h-6 w-6" />,
      title: "Security & Lockout",
      description: "Lockouts, security issues",
      responseTime: "15-30 min",
      availability: "24/7",
      phoneNumber: "+1-800-LOCKOUT",
      isActive: true
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-8 bg-gradient-to-r from-red-50 to-orange-50 border-t-4 border-red-500">
      <div className="container mx-auto px-6">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {(emergencySettings as any)?.title || 'Need immediate assistance?'}
                  </h2>
                  <p className="text-lg opacity-90">
                    {(emergencySettings as any)?.subtitle || 'Our 24/7 emergency services are ready to help'}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-lg font-semibold">
                    {formatTime(currentTime)}
                  </span>
                </div>
                <Badge className="bg-green-500 text-white hover:bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  All Services Online
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {emergencyServices.map((service) => (
            <Card key={service.id} className="bg-white border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                {/* Service Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    {service.icon}
                  </div>
                  {service.isActive && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Available
                    </Badge>
                  )}
                </div>

                {/* Service Info */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>

                {/* Response Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-2" />
                    Response: {service.responseTime}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    Available: {service.availability}
                  </div>
                </div>

                {/* Emergency CTA */}
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    {service.phoneNumber}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Guidelines */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-orange-500">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Emergency Service Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">When to Call Emergency Services:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Water leaks causing property damage</li>
                    <li>• Complete power outage or electrical hazards</li>
                    <li>• No heating/cooling in extreme weather</li>
                    <li>• Security breaches or lockouts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">What to Expect:</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Immediate response confirmation</li>
                    <li>• Professional arrives within stated time</li>
                    <li>• Transparent emergency pricing</li>
                    <li>• Quality guarantee on all work</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">&lt; 30 min</div>
            <p className="text-gray-600 text-sm">Average Response</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
            <p className="text-gray-600 text-sm">Always Available</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
            <p className="text-gray-600 text-sm">Licensed Experts</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">5000+</div>
            <p className="text-gray-600 text-sm">Emergency Calls</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyServices;