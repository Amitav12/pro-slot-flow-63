import React from 'react';
import { Star, TrendingUp, Sparkles, ArrowRight, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const navigate = useNavigate();
  const popularServices = [
    {
      id: 1,
      name: 'House Cleaning',
      category: 'Cleaning',
      price: 'Starting at $75',
      rating: 4.9,
      reviews: 1247,
      badge: 'Most Popular',
      description: 'Professional deep cleaning for your home',
      isPopular: true
    },
    {
      id: 2,
      name: 'Plumbing Repair',
      category: 'Home Maintenance',
      price: 'Starting at $85',
      rating: 4.8,
      reviews: 892,
      badge: 'Highly Rated',
      description: 'Expert plumbing solutions for all your needs',
      isPopular: true
    },
    {
      id: 3,
      name: 'Personal Training',
      category: 'Fitness',
      price: 'Starting at $60/session',
      rating: 4.9,
      reviews: 634,
      badge: 'Top Rated',
      description: 'Achieve your fitness goals with expert guidance',
      isPopular: true
    },
    {
      id: 4,
      name: 'Tutoring Services',
      category: 'Education',
      price: 'Starting at $45/hour',
      rating: 4.7,
      reviews: 423,
      badge: 'Trending',
      description: 'Personalized learning for all subjects',
      isPopular: true
    },
    {
      id: 5,
      name: 'Lawn Care',
      category: 'Landscaping',
      price: 'Starting at $50',
      rating: 4.6,
      reviews: 567,
      badge: 'Seasonal',
      description: 'Keep your lawn beautiful year-round',
      isPopular: true
    },
    {
      id: 6,
      name: 'Photography',
      category: 'Creative',
      price: 'Starting at $200',
      rating: 4.8,
      reviews: 289,
      badge: 'Premium',
      description: 'Capture your special moments professionally',
      isPopular: true
    }
  ];

  const newServices = [
    {
      id: 1,
      name: 'Smart Home Setup',
      category: 'Technology',
      price: 'Starting at $120',
      badge: 'New',
      description: 'Complete smart home automation setup',
      isNew: true
    },
    {
      id: 2,
      name: 'Pet Grooming at Home',
      category: 'Pet Care',
      price: 'Starting at $55',
      badge: 'New',
      description: 'Professional pet grooming services',
      isNew: true
    },
    {
      id: 3,
      name: 'Elderly Care Services',
      category: 'Healthcare',
      price: 'Starting at $25/hr',
      badge: 'New',
      description: 'Compassionate care for your loved ones',
      isNew: true
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Popular Services */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                Popular Services
              </h2>
              <p className="text-lg text-gray-600">
                Most requested services in your area
              </p>
            </div>
            <Button 
              variant="outline" 
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
              onClick={() => {
                console.log('Recommendations View All clicked - navigating to /all-popular-services');
                try {
                  navigate('/all-popular-services');
                } catch (error) {
                  console.error('Navigation failed, using fallback:', error);
                  window.location.href = '/all-popular-services';
                }
              }}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Card key={service.id} className="bg-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-orange-500 text-white border-0">
                      {service.badge}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 p-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {service.category}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {service.rating} ({service.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-900">
                      {service.price}
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Recommendations;