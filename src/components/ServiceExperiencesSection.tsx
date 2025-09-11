import React from 'react';
import { VideoCarousel } from '@/components/VideoCarousel';

interface Experience {
  id: string;
  title: string;
  category: string;
  rating: number;
  duration: string;
  customerName: string;
  videoThumbnail: string;
  videoUrl: string;
  description: string;
}

const experiences: Experience[] = [
  {
    id: '1',
    title: 'Professional Home Cleaning',
    category: 'Home Services',
    rating: 4.9,
    duration: '2 hours',
    customerName: 'Sarah M.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/cleaning-service.mp4',
    description: 'Watch how our professional cleaners transformed this home with attention to detail and eco-friendly products.'
  },
  {
    id: '2',
    title: 'Expert Electrical Installation',
    category: 'Electrical',
    rating: 5.0,
    duration: '3 hours',
    customerName: 'Mike R.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/electrical-service.mp4',
    description: 'See our certified electrician install smart home switches with precision and safety as top priority.'
  },
  {
    id: '3',
    title: 'Professional Car Wash',
    category: 'Automotive',
    rating: 4.8,
    duration: '1 hour',
    customerName: 'Lisa K.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/car-wash.mp4',
    description: 'Experience our premium car washing service that leaves vehicles spotless inside and out.'
  },
  {
    id: '4',
    title: 'Beauty & Wellness Session',
    category: 'Beauty',
    rating: 4.9,
    duration: '90 minutes',
    customerName: 'Emma J.',
    videoThumbnail: '/api/placeholder/300/200',
    videoUrl: '/videos/beauty-service.mp4',
    description: 'Relax and rejuvenate with our professional beauty treatments in the comfort of your home.'
  }
];

export const ServiceExperiencesSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Experiences</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See real customer experiences and the quality of service our professionals deliver. 
            Every service is completed with care, expertise, and attention to detail.
          </p>
        </div>

        {/* Import VideoCarousel component here */}
        <VideoCarousel />
      </div>
    </section>
  );
};