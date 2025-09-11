import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  review: string;
  date: string;
  avatar?: string;
}

const CustomerTestimonials: React.FC = () => {
  const { data: testimonialsData, isLoading } = useAdminSettings('customer_testimonials');

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

  const testimonials: Testimonial[] = (testimonialsData as any)?.testimonials?.map((testimonial: any, index: number) => ({
    id: index + 1,
    name: testimonial.name,
    location: testimonial.location,
    service: testimonial.service,  
    rating: testimonial.rating,
    review: testimonial.comment,
    date: "Recent",
    avatar: testimonial.name.split(' ').map((n: string) => n[0]).join('')
  })) || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Quote className="h-4 w-4 mr-2" />
            Customer Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {(testimonialsData as any)?.title || 'What Our Customers Say'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {(testimonialsData as any)?.subtitle || 'Real experiences from thousands of satisfied customers across the city'}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4 line-clamp-4 text-sm leading-relaxed">
                  "{testimonial.review}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {testimonial.service}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
};

export default CustomerTestimonials;