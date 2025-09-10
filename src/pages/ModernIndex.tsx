import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/HeroSection';
import { CategoryGrid } from '@/components/CategoryGrid';
import QuickActions from '@/components/QuickActions';
import Recommendations from '@/components/Recommendations';

import { VideoCarousel } from '@/components/VideoCarousel';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import SafetyBadges from '@/components/SafetyBadges';
import PromotionalOffers from '@/components/PromotionalOffers';
import HowItWorks from '@/components/HowItWorks';
import ServiceGuarantee from '@/components/ServiceGuarantee';

import { NewServices } from '@/components/NewServices';

interface Service {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  image_url?: string;
  duration_minutes: number;
  rating: number;
  total_bookings: number;
  provider_id: string;
  provider?: {
    id: string;
    business_name: string;
    rating: number;
    years_of_experience: number;
    profile_image_url?: string;
    total_reviews: number;
  };
  subcategories?: {
    name: string;
  };
}

interface Provider {
  id: string;
  business_name: string;
  rating: number;
  years_of_experience: number;
  total_reviews: number;
  total_completed_jobs: number;
  profile_image_url?: string;
  specializations: string[];
  certifications: string[];
  response_time_minutes: number;
}

interface TimeSlot {
  id: number;
  time: string;
  price: number;
  available: boolean;
  date: string;
}

const ModernIndex: React.FC = () => {
  const handleServiceSelect = (service: Service) => {
    // Navigate to provider selection or service details
    console.log('Service selected:', service);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
  };

  const handleExploreServices = () => {
    // Scroll to services section
    console.log('Exploring services - scroll to services section');
    const servicesSection = document.querySelector('[data-section="services"]');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  console.log('🏠 ModernIndex component rendering...');

  return (
    <Layout>
      {/* Above the Fold Priority (First 3) */}
      <HeroSection onExploreServices={handleExploreServices} />
      <CategoryGrid 
        onCategorySelect={handleCategorySelect}
        selectedCategory={null}
      />
      
      {/* Primary Engagement Zone (4-7) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NewServices onServiceSelect={handleServiceSelect} />
      </div>
      <HowItWorks />
      <PromotionalOffers />
      
      {/* Personalization & Social Proof (11-14) */}
      <Recommendations />
      <VideoCarousel />
      <CustomerTestimonials />
      <ServiceGuarantee />
    </Layout>
  );
};

export default ModernIndex;
