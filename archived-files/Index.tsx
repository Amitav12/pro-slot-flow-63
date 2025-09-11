import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { LocationModal } from '@/components/LocationModal';
import { ProviderDetailsModal } from '@/components/ProviderDetailsModal';
import { SlotBookingModal } from '@/components/SlotBookingModal';
import { ProfessionalServiceCard } from '@/components/ProfessionalServiceCard';
import { CartSidebar } from '@/components/CartSidebar';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  Shield, 
  Award, 
  TrendingUp, 
  Heart, 
  Clock,
  ShoppingCart 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { ServiceExperiencesSection } from '../components/ServiceExperiencesSection';

// Types (matching existing interfaces)
interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
  price: number;
  date: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  rating: number;
  category: string;
  description: string;
  isPopular: boolean;
}

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  responseTime: string;
  verified: boolean;
  completedJobs: number;
  description: string;
  phone: string;
  email: string;
  services: string[];
  price: number;
  originalPrice?: number;
  address?: string;
  availability?: any;
}

// Mock data for demonstration
const mockServices: Service[] = [
  { id: 1, name: 'House Cleaning', price: 120, duration: 120, rating: 4.8, category: 'cleaning', description: 'Professional deep cleaning', isPopular: true },
  { id: 2, name: 'Plumbing Repair', price: 85, duration: 60, rating: 4.6, category: 'home-repair', description: 'Emergency plumbing services', isPopular: false },
  { id: 3, name: 'Hair Styling', price: 45, duration: 90, rating: 4.9, category: 'beauty', description: 'Professional hair styling', isPopular: true },
];

const mockProviders: Provider[] = [
  {
    id: 1,
    name: 'Elite Cleaning Services',
    rating: 4.8,
    reviews: 156,
    location: 'Downtown',
    distance: '1.2 km',
    responseTime: '15min',
    verified: true,
    completedJobs: 200,
    description: 'Professional cleaning services',
    phone: '+1234567890',
    email: 'elite@cleaning.com',
    services: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning'],
    price: 120,
    originalPrice: 150
  },
  {
    id: 2,
    name: 'Pro Handyman Services',
    rating: 4.6,
    reviews: 89,
    location: 'Midtown',
    distance: '2.1 km',
    responseTime: '30min',
    verified: true,
    completedJobs: 120,
    description: 'Expert handyman services',
    phone: '+1234567891',
    email: 'pro@handyman.com',
    services: ['Plumbing', 'Electrical', 'Carpentry'],
    price: 85
  },
  {
    id: 3,
    name: 'Beauty Experts Salon',
    rating: 4.9,
    reviews: 234,
    location: 'Uptown',
    distance: '1.8 km',
    responseTime: '20min',
    verified: true,
    completedJobs: 400,
    description: 'Professional beauty services',
    phone: '+1234567892',
    email: 'beauty@experts.com',
    services: ['Hair Styling', 'Manicure', 'Facial'],
    price: 45,
    originalPrice: 60
  }
];

const mockTimeSlots: TimeSlot[] = [
  { id: 1, time: '09:00', available: true, price: 120, date: '2024-03-15' },
  { id: 2, time: '10:30', available: true, price: 120, date: '2024-03-15' },
  { id: 3, time: '14:00', available: false, price: 120, date: '2024-03-15' },
  { id: 4, time: '16:30', available: true, price: 150, date: '2024-03-15' },
];

const mockFavorites = new Set([1, 3]);

// Icon mapping for categories
const categoryIconMap: { [key: string]: string } = {
  '🏠': '🏠',
  '🔧': '🔧',
  '💄': '💄',
  '🚗': '🚗',
  '💻': '💻',
  '🏃': '🏃',
  'home': '🏠',
  'repair': '🔧',
  'beauty': '💄',
  'automotive': '🚗',
  'technology': '💻',
  'fitness': '🏃',
};

// Utility function
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function Index() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Select your location');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotTimer, setSlotTimer] = useState(0);
  const [favorites, setFavorites] = useState(mockFavorites);
  const [locationLoading, setLocationLoading] = useState(false);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Hooks
  const { isAuthenticated } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { subcategories } = useSubcategories(selectedCategory);
  const { items: cartItems, itemCount, totalAmount } = useCart();

  // Debug logs for cart functionality (only when count changes)
  useEffect(() => {
    console.log('Index: Cart updated - Count:', itemCount, 'Total:', totalAmount);
  }, [itemCount]);
  
  
  // Generate time slots with useMemo for proper state dependency
  const currentTimeSlots = useMemo(() => {
    if (!selectedProvider) return mockTimeSlots;
    
    const baseSlots = [
      { time: '09:00', price: 120 },
      { time: '10:30', price: 120 },
      { time: '12:00', price: 120 },
      { time: '14:00', price: 120 },
      { time: '16:30', price: 150 },
      { time: '18:00', price: 150 },
    ];
    
    return baseSlots.map((slot, index) => ({
      id: index + 1,
      ...slot,
      available: Math.random() > 0.2, // Better availability
      date: format(new Date(), 'yyyy-MM-dd') // Use current date for initial slots
    }));
  }, [selectedProvider]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, [timerRef]);

  // Query for services based on selected subcategory
  const { data: categoryServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['provider-services', selectedSubcategory],
    queryFn: async () => {
      if (!selectedSubcategory) return [];
      
      // Get provider services for the selected subcategory
      const { data: providerServices, error } = await supabase
        .from('provider_services')
        .select(`
          *,
          subcategories!inner (
            id,
            name,
            description,
            min_price,
            max_price
          )
        `)
        .eq('subcategory_id', selectedSubcategory)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching services:', error);
        return [];
      }

      if (!providerServices || providerServices.length === 0) {
        return [];
      }

      // Get provider details for these services
      const providerIds = providerServices.map(ps => ps.provider_id).filter(Boolean);
      
      // First get user_profiles to get the user_id from provider_id
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, business_name')
        .in('id', providerIds);

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
        return providerServices.map(ps => ({ ...ps, service_providers: null, user_profile: null }));
      }

      // Then get service_providers using the user_id
      const userIds = userProfiles?.map(up => up.user_id).filter(Boolean) || [];
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'approved');

      if (providersError) {
        console.error('Error fetching providers:', providersError);
        return providerServices.map(ps => ({ ...ps, service_providers: null, user_profile: null }));
      }

      // Combine the data
      return providerServices.map(ps => {
        const userProfile = userProfiles?.find(up => up.id === ps.provider_id);
        const provider = providers?.find(p => p.user_id === userProfile?.user_id);
        return {
          ...ps,
          service_providers: provider,
          user_profile: userProfile
        };
      });
    },
    enabled: !!selectedSubcategory,
  });

  // Query for popular services with their providers
  const { data: popularServices, isLoading: popularServicesLoading } = useQuery({
    queryKey: ['popular-services'],
    queryFn: async () => {
      // First get services marked as popular
      const { data: popularServiceData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_popular', true)
        .eq('is_active', true);

      if (servicesError) {
        console.error('Error fetching popular services:', servicesError);
        return [];
      }

      if (!popularServiceData || popularServiceData.length === 0) {
        return [];
      }

      // Get subcategories for these services
      const subcategoryIds = popularServiceData.map(service => service.subcategory_id).filter(Boolean);
      
      if (subcategoryIds.length === 0) {
        return [];
      }

      // Get provider services for these subcategories
      const { data: providerServices, error: providerError } = await supabase
        .from('provider_services')
        .select(`
          *,
          subcategories!inner (
            id,
            name,
            description
          )
        `)
        .in('subcategory_id', subcategoryIds)
        .eq('status', 'approved')
        .eq('is_active', true)
        .limit(6);

      if (providerError) {
        console.error('Error fetching provider services:', providerError);
        return [];
      }

      // Get provider details for these services
      if (providerServices && providerServices.length > 0) {
        const providerIds = providerServices.map(ps => ps.provider_id).filter(Boolean);
        
        // First get user_profiles to get the user_id from provider_id
        const { data: userProfiles, error: userProfilesError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, business_name')
          .in('id', providerIds);

        if (userProfilesError) {
          console.error('Error fetching user profiles:', userProfilesError);
          return providerServices.map(ps => ({ ...ps, service_providers: null, user_profile: null }));
        }

        // Then get service_providers using the user_id
        const userIds = userProfiles?.map(up => up.user_id).filter(Boolean) || [];
        const { data: providers, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .in('user_id', userIds)
          .eq('status', 'approved');

        if (providersError) {
          console.error('Error fetching providers:', providersError);
          return providerServices.map(ps => ({ ...ps, service_providers: null, user_profile: null }));
        }

        // Combine the data
        return providerServices.map(ps => {
          const userProfile = userProfiles?.find(up => up.id === ps.provider_id);
          const provider = providers?.find(p => p.user_id === userProfile?.user_id);
          return {
            ...ps,
            service_providers: provider,
            user_profile: userProfile
          };
        });
      }

      return [];
    }
  });

  // Query for all available services with providers count
  const { data: allAvailableServices, isLoading: allServicesLoading } = useQuery({
    queryKey: ['all-available-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          subcategory_id,
          provider_id,
          subcategories!inner (
            id,
            name,
            description,
            category_id,
            categories!inner (
              id,
              name,
              icon
            )
          )
        `)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching available services:', error);
        return [];
      }

      // Group by subcategory and count unique providers
      const serviceMap = new Map();
      data?.forEach(service => {
        const key = service.subcategory_id;
        if (!serviceMap.has(key)) {
          serviceMap.set(key, {
            ...service.subcategories,
            providerCount: 0,
            providerIds: new Set()
          });
        }
        serviceMap.get(key).providerIds.add(service.provider_id);
      });

      // Convert Set to count
      return Array.from(serviceMap.values()).map(service => ({
        ...service,
        providerCount: service.providerIds.size,
        providerIds: undefined // Remove the Set
      }));
    }
  });

  // Event handlers
  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleBookService = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowSlotModal(true);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSlotTimer(900); // 15 minutes in seconds
    
    // Clear any existing timer
    if (timerRef) {
      clearInterval(timerRef);
    }
    
    // Set new timer - only for visual countdown, don't clear slot
    const newTimer = setInterval(() => {
      setSlotTimer((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          // Timer expired, just clear the timer but keep slot
          clearInterval(newTimer);
          setTimerRef(null);
          return 0;
        }
      });
    }, 1000);
    
    setTimerRef(newTimer);
  };

  const toggleFavorite = (providerId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId);
      } else {
        newFavorites.add(providerId);
      }
      return newFavorites;
    });
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  // Remove duplicate timer effect - timer is handled in handleSlotSelect

  // Loading state
  if (categoriesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onCartClick={() => setShowCartSidebar(true)}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-surface to-background py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Brand Header */}
            <div className="mb-8 lg:mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4 mr-2" />
                Service NB LINK - Digital Business Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
                Professional
                <span className="block text-primary"> Digital Services</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-normal text-muted-foreground block mt-2">
                  Near You
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                Connect with verified digital transformation experts and professional service providers. 
                Quality guaranteed, innovation delivered.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 lg:p-8 max-w-5xl mx-auto mb-12 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="lg:col-span-4 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-left hover:bg-surface transition-colors text-foreground"
                  >
                    {selectedLocation}
                  </button>
                </div>
                <div className="lg:col-span-2">
                <Button className="w-full py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl transition-all hover:shadow-lg">
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Cart Button */}
            {itemCount > 0 && (
              <div className="fixed bottom-6 right-6 z-40">
                <button
                  onClick={() => setShowCartSidebar(true)}
                  className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-primary/20"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>View Cart • ₹{totalAmount.toLocaleString()}</span>
                  <div className="bg-white/20 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {itemCount}
                  </div>
                </button>
              </div>
            )}

            {/* Professional Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 border border-primary/20 text-primary mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 lg:h-10 lg:w-10" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">500+</div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">Verified Professionals</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-success/10 border border-success/20 text-success mx-auto mb-4 group-hover:scale-110 group-hover:bg-success group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center">
                  <Award className="h-8 w-8 lg:h-10 lg:w-10" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">50+</div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">Service Categories</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-info/10 border border-info/20 text-info mx-auto mb-4 group-hover:scale-110 group-hover:bg-info group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 lg:h-10 lg:w-10" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">10k+</div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">Happy Customers</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-warning/10 border border-warning/20 text-warning mx-auto mb-4 group-hover:scale-110 group-hover:bg-warning group-hover:text-white transition-all duration-300 rounded-2xl flex items-center justify-center">
                  <Star className="h-8 w-8 lg:h-10 lg:w-10" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">4.8★</div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Digital Business Solutions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Explore Professional Services
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Transform your business with our comprehensive digital solutions and professional services, 
              delivered by certified experts who understand your industry needs.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading categories...</p>
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((category: any) => (
                <Card
                  key={category.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${
                    selectedCategory === category.id 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === category.id ? null : category.id);
                    setSelectedSubcategory(null);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-primary-foreground scale-110' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110'
                    }`}>
                      <span className="text-2xl">{categoryIconMap[category.icon] || '🔧'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{category.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{category.description}</p>
                    <div className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {selectedCategory === category.id ? 'Selected' : 'Click to explore'}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Categories Available</h3>
                <p className="text-muted-foreground">Service categories will appear here once they're added by administrators.</p>
              </div>
            )}
          </div>

          {/* Subcategories Section */}
          {selectedCategory && (
            <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 lg:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium mb-4">
                  <Award className="h-4 w-4 mr-2" />
                  {categories?.find(c => c.id === selectedCategory)?.name}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  Available Services
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose from our specialized services designed to meet your business needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories?.map((subcategory: any) => (
                  <Card
                    key={subcategory.id} 
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      selectedSubcategory === subcategory.id 
                        ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSubcategory(selectedSubcategory === subcategory.id ? null : subcategory.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        selectedSubcategory === subcategory.id 
                          ? 'bg-primary text-primary-foreground scale-110' 
                          : 'bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white group-hover:scale-110'
                      }`}>
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-3">{subcategory.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{subcategory.description}</p>
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-muted-foreground mb-1">Price Range</div>
                        <div className="text-lg font-bold text-foreground">
                          ${subcategory.min_price} - ${subcategory.max_price}
                        </div>
                      </div>
                      <Button 
                        variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                      >
                        {selectedSubcategory === subcategory.id ? (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Select Service'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {(!subcategories || subcategories.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-2">No Services Available</h4>
                  <p className="text-muted-foreground">Services will appear here once they're added for this category.</p>
                </div>
              )}
            </div>
          )}

          {/* Providers Section */}
          {selectedSubcategory && (
            <div className="mt-12 bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-2xl p-8 lg:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center px-4 py-2 bg-success text-white rounded-full text-sm font-medium mb-4">
                  <Shield className="h-4 w-4 mr-2" />
                  Verified Providers
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  Available Providers for {subcategories?.find(sc => sc.id === selectedSubcategory)?.name}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  All providers are verified professionals with proven track records in their expertise
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {servicesLoading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-success border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading providers...</p>
                  </div>
                ) : categoryServices && categoryServices.length > 0 ? (
                  categoryServices.map((service: any) => (
                    <ProfessionalServiceCard
                      key={service.id}
                      service={service}
                      onBook={(selectedService) => {
                        // Convert service to provider format for existing modal
                        const provider = {
                          id: parseInt(service.id) || 1,
                          name: service.service_providers?.business_name || service.user_profile?.business_name || 'Professional Service',
                          rating: service.service_providers?.rating || 4.5,
                          reviews: service.service_providers?.total_reviews || 0,
                          location: 'Professional Location',
                          distance: '1.5 km',
                          responseTime: '15min',
                          verified: true,
                          completedJobs: 50,
                          description: service.description || 'Professional service provider',
                          phone: '+1234567890',
                          email: 'provider@servicenblink.com',
                          services: [service.service_name],
                          price: service.price
                        };
                        console.log('Index: Booking service with provider:', provider);
                        handleBookService(provider);
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium text-foreground mb-2">No Providers Available</h4>
                    <p className="text-muted-foreground">Providers will appear here once they register for this service.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Available Services Section */}
      {!selectedSubcategory && allAvailableServices && allAvailableServices.length > 0 && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-surface to-background">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-info/10 text-info rounded-full text-sm font-medium mb-6">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ready to Serve
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Available Services</h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Explore all professional services with registered providers ready to transform your business
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {allAvailableServices.slice(0, 6).map((service: any, index: number) => (
                <Card 
                  key={service.id} 
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 hover:border-info/30"
                  onClick={() => setSelectedSubcategory(service.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-info to-info/80 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-xl font-bold">{service.categories?.icon || '🔧'}</span>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">
                        <Shield className="h-3 w-3 mr-1" />
                        {service.providerCount} provider{service.providerCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-info transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                      {service.description || 'Professional service designed to meet your business needs with expert precision and care.'}
                    </p>
                    <Button variant="outline" size="sm" className="w-full group-hover:border-info group-hover:text-info">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Providers
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {allAvailableServices.length > 6 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="px-8">
                  View All Services ({allAvailableServices.length})
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Services Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-warning/10 text-warning rounded-full text-sm font-medium mb-4">
                <Star className="h-4 w-4 mr-2" />
                Most Requested
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Popular Services</h2>
              <p className="text-lg lg:text-xl text-muted-foreground">Most booked services this week</p>
            </div>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground self-start sm:self-auto">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {popularServicesLoading ? (
              <div className="col-span-full text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading popular services...</p>
              </div>
            ) : popularServices && popularServices.length > 0 ? (
              popularServices.map((service: any, index: number) => (
                <Card key={service.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-warning/30 relative overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-warning text-white shadow-lg">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/80 text-white group-hover:scale-110 transition-transform rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold">{service.service_providers?.business_name?.charAt(0) || 'P'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                            {service.service_providers?.business_name || 'Professional Provider'}
                          </h4>
                          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{service.service_providers?.address || 'Location'}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(parseInt(service.service_providers?.id) || service.id)}
                        className="text-muted-foreground hover:text-error hover:bg-error/10 transition-all p-2 flex-shrink-0"
                      >
                        <Heart className={`h-5 w-5 ${favorites.has(parseInt(service.service_providers?.id) || service.id) ? 'fill-error text-error' : ''}`} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="font-semibold text-foreground">{service.service_providers?.rating || 4.5}</span>
                        <span className="text-muted-foreground">({service.service_providers?.total_reviews || 0})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Responds in {service.service_providers?.response_time_minutes || 15}min</span>
                      </div>
                      {service.service_providers?.status === 'approved' && (
                        <div className="flex items-center text-success text-sm">
                          <Shield className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-foreground">{service.service_name}</h5>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">${service.price}</div>
                          <div className="text-xs text-muted-foreground">Starting price</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description || 'Professional service delivered with expertise'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group-hover:border-warning group-hover:text-warning"
                        onClick={() => {
                          const mockProvider: Provider = {
                            id: parseInt(service.service_providers?.id || service.id) || 1,
                            name: service.service_providers?.business_name || 'Professional Provider',
                            rating: service.service_providers?.rating || 4.5,
                            reviews: service.service_providers?.total_reviews || 0,
                            location: service.service_providers?.address || 'Location',
                            distance: '2.1 km',
                            responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                            verified: service.service_providers?.status === 'approved',
                            completedJobs: service.service_providers?.total_completed_jobs || 0,
                            description: service.description || 'Professional service',
                            phone: '+1234567890',
                            email: 'provider@example.com',
                            services: [service.service_name],
                            price: service.price,
                            originalPrice: null
                          };
                          setSelectedProvider(mockProvider);
                          setShowProviderModal(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-warning hover:bg-warning/90 text-white"
                        onClick={() => {
                          const mockProvider: Provider = {
                            id: parseInt(service.service_providers?.id || service.id) || 1,
                            name: service.service_providers?.business_name || 'Professional Provider',
                            rating: service.service_providers?.rating || 4.5,
                            reviews: service.service_providers?.total_reviews || 0,
                            location: service.service_providers?.address || 'Location',
                            distance: '2.1 km',
                            responseTime: service.service_providers?.response_time_minutes ? `${service.service_providers.response_time_minutes}min` : '15min',
                            verified: service.service_providers?.status === 'approved',
                            completedJobs: service.service_providers?.total_completed_jobs || 0,
                            description: service.description || 'Professional service',
                            phone: '+1234567890',
                            email: 'provider@example.com',
                            services: [service.service_name],
                            price: service.price,
                            originalPrice: null
                          };
                          setSelectedProvider(mockProvider);
                          setShowSlotModal(true);
                        }}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No Popular Services Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Popular services will appear here once administrators mark services as trending and providers register for them.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-primary-hover/95"></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Service NB LINK Guarantee
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Why Choose Service NB LINK?</h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              We're committed to providing you with the best digital transformation experience through trust, 
              innovation, and exceptional service delivery that drives real business results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <Shield className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4">Certified Professionals</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                All service providers are thoroughly vetted, certified, and continuously monitored 
                for quality assurance and professional standards.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <Award className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4">Quality Guaranteed</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                100% satisfaction guaranteed with comprehensive project management, 
                milestone tracking, and full ownership of all deliverables.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4">Innovation First</h3>
              <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                Cutting-edge solutions using the latest technologies, AI automation, 
                and industry best practices to future-proof your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Experiences Section */}
      <ServiceExperiencesSection />

      {/* Modals */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        loading={locationLoading}
      />

      <ProviderDetailsModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        provider={selectedProvider as any}
        onBookNow={() => {
          setShowProviderModal(false);
          if (selectedProvider) {
            handleBookService(selectedProvider);
          }
        }}
        onToggleFavorite={(id) => toggleFavorite(parseInt(id.toString()))}
        isFavorite={selectedProvider ? favorites.has(selectedProvider.id) : false}
      />

      <SlotBookingModal
        isOpen={showSlotModal}
        onClose={() => {
          setShowSlotModal(false);
          setSelectedSlot(null);
          // Clear timer on modal close
          if (timerRef) {
            clearInterval(timerRef);
            setTimerRef(null);
          }
          setSlotTimer(0);
        }}
        provider={selectedProvider as any}
        timeSlots={currentTimeSlots as any}
        selectedSlot={selectedSlot as any}
        onSlotSelect={handleSlotSelect}
        slotTimer={slotTimer}
        formatTime={formatTime}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
      />
    </Layout>
  );
}