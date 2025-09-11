import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Award, CheckCircle, Users } from 'lucide-react';

interface Professional {
  id: number;
  name: string;
  profession: string;
  specialization: string[];
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  avatar: string;
  isVerified: boolean;
  isTopRated: boolean;
  badges: string[];
  startingPrice: number;
}

const FeaturedProfessionals: React.FC = () => {
  const professionals: Professional[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      profession: "Home Cleaning Specialist",
      specialization: ["Deep Cleaning", "Regular Maintenance", "Move-in/out"],
      rating: 4.9,
      totalReviews: 324,
      yearsExperience: 8,
      completedJobs: 1250,
      responseTime: "< 30 min",
      location: "Downtown Area",
      avatar: "SJ",
      isVerified: true,
      isTopRated: true,
      badges: ["Top Rated", "Quick Response"],
      startingPrice: 45
    },
    {
      id: 2,
      name: "Michael Chen",
      profession: "AC & Appliance Repair",
      specialization: ["AC Repair", "Refrigerator", "Washing Machine"],
      rating: 4.8,
      totalReviews: 198,
      yearsExperience: 12,
      completedJobs: 890,
      responseTime: "< 45 min",
      location: "Westside",
      avatar: "MC",
      isVerified: true,
      isTopRated: true,
      badges: ["Expert", "Same Day Service"],
      startingPrice: 60
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      profession: "Beauty & Wellness Expert",
      specialization: ["Massage Therapy", "Facial Treatment", "Manicure/Pedicure"],
      rating: 5.0,
      totalReviews: 156,
      yearsExperience: 6,
      completedJobs: 670,
      responseTime: "< 1 hour",
      location: "Eastside",
      avatar: "ER",
      isVerified: true,
      isTopRated: true,
      badges: ["Certified", "Premium Service"],
      startingPrice: 80
    },
    {
      id: 4,
      name: "David Thompson",
      profession: "Plumbing & Electrical",
      specialization: ["Emergency Repairs", "Installation", "Maintenance"],
      rating: 4.7,
      totalReviews: 267,
      yearsExperience: 15,
      completedJobs: 1450,
      responseTime: "< 20 min",
      location: "Northside",
      avatar: "DT",
      isVerified: true,
      isTopRated: false,
      badges: ["Emergency Service", "Licensed"],
      startingPrice: 75
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Award className="h-4 w-4 mr-2" />
            Featured Experts
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Top Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked experts with proven track records and exceptional customer satisfaction
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {professionals.map((professional) => (
            <Card key={professional.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-0">
                {/* Header with Avatar */}
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white relative">
                  {professional.isTopRated && (
                    <Badge className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg mb-3 shadow-lg">
                      {professional.avatar}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      {professional.name}
                    </h3>
                    <p className="text-sm opacity-90 text-center">
                      {professional.profession}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {renderStars(professional.rating)}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {professional.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({professional.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {professional.isVerified && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {professional.badges.slice(0, 1).map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Specializations */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Specializes in:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {professional.specialization.join(', ')}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      {professional.completedJobs} jobs
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {professional.responseTime}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="h-3 w-3 mr-1" />
                      {professional.yearsExperience}+ years
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {professional.location}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${professional.startingPrice}
                        </p>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Why Choose Our Professionals?
            </h3>
            <p className="text-gray-600">
              Every professional on our platform meets our strict quality standards
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
              <p className="text-gray-600 text-sm">Background Verified</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">5+</div>
              <p className="text-gray-600 text-sm">Years Experience</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4.8+</div>
              <p className="text-gray-600 text-sm">Average Rating</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">1000+</div>
              <p className="text-gray-600 text-sm">Completed Jobs</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
            View All Professionals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfessionals;