import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowRight, MapPin, Shield, DollarSign, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreServices }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: heroContent, isLoading } = useAdminSettings('hero_content');
  const { data: companyInfo } = useAdminSettings('company_info');
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
  const userLocation = 'New Delhi'; // This would come from user's saved location or geolocation

  if (isLoading) {
    return <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-16 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>;
  }

  const trustIndicators = (heroContent as any)?.trust_indicators || [
    { icon: 'Shield', text: 'Verified professionals' },
    { icon: 'DollarSign', text: 'Transparent pricing' },
    { icon: 'Award', text: 'Quality guaranteed' },
    { icon: 'Star', text: 'Safe & secure' }
  ];

  const serviceCards = (heroContent as any)?.service_cards || [
    { emoji: '🏠', title: 'Home Cleaning', description: 'Deep cleaning & more', color: 'purple' },
    { emoji: '💄', title: 'Beauty & Wellness', description: 'Salon at home', color: 'orange' },
    { emoji: '🔧', title: 'Appliance Repair', description: 'AC, fridge & more', color: 'green' },
    { emoji: '👨‍🍳', title: 'Personal Chef', description: 'Home cooking', color: 'blue' }
  ];

  const getIconComponent = (iconName: string) => {
    const icons = { Shield, DollarSign, Award, Star };
    return icons[iconName as keyof typeof icons] || Shield;
  };

  const getColorClass = (color: string) => {
    const colors = {
      purple: 'bg-purple-100',
      orange: 'bg-orange-100', 
      green: 'bg-green-100',
      blue: 'bg-blue-100'
    };
    return colors[color as keyof typeof colors] || 'bg-purple-100';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      <div className="relative px-6 py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Welcome Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {(heroContent as any)?.subtitle?.replace('Hi there!', `Hi ${userName}!`) || `Hi ${userName}!`}
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span>Services available in {userLocation}</span>
              </div>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {(heroContent as any)?.title || 'What can we help you with '}
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                today?
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              {(heroContent as any)?.description || 'Book trusted professionals for cleaning, repairs, beauty and more. Quality service at your doorstep.'}
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {trustIndicators.map((indicator, index) => {
                const IconComponent = getIconComponent(indicator.icon);
                return (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{indicator.text}</span>
                  </div>
                );
              })}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={() => {
                  console.log('Hero Book Service button clicked - navigating to /all-categories');
                  try {
                    navigate('/all-categories');
                  } catch (error) {
                    console.error('Navigation failed, using fallback:', error);
                    window.location.href = '/all-categories';
                  }
                }}
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Your First Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  console.log('Hero How it Works button clicked - scrolling to services');
                  try {
                    onExploreServices();
                  } catch (error) {
                    console.error('Scroll failed:', error);
                  }
                }}
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                How it Works
              </Button>
            </div>
          </div>

          {/* Right Content - Service Cards Preview */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {serviceCards.map((card, index) => (
                <Card key={index} className="card-floating animate-float hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 0.5}s` }}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 ${getColorClass(card.color)} rounded-xl flex items-center justify-center mb-3`}>
                      {card.emoji}
                    </div>
                    <h3 className="font-semibold mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-400/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};