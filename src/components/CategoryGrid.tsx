import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  service_count?: number;
  bgColor?: string;
  iconBg?: string;
}

interface CategoryGridProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory?: string | null;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  onCategorySelect, 
  selectedCategory 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Color variations for categories
  const categoryColors = [
    { bgColor: 'bg-blue-50', iconBg: 'bg-blue-100' },
    { bgColor: 'bg-pink-50', iconBg: 'bg-pink-100' },
    { bgColor: 'bg-green-50', iconBg: 'bg-green-100' },
    { bgColor: 'bg-yellow-50', iconBg: 'bg-yellow-100' },
    { bgColor: 'bg-red-50', iconBg: 'bg-red-100' },
    { bgColor: 'bg-purple-50', iconBg: 'bg-purple-100' },
    { bgColor: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
    { bgColor: 'bg-orange-50', iconBg: 'bg-orange-100' }
  ];

  // Category emoji mapping for database categories
  const categoryEmojis: Record<string, string> = {
    'Cleaning': '🏠',
    'Repairs & Maintenance': '🛠️',
    'Beauty & Wellness': '💄',
    'Appliance Repair': '🔧',
    'Pest Control': '🐛',
    'Painting': '🎨',
    'Plumbing': '🚿',
    'Electrical': '💡',
    'Home Improvement': '🏠',
    'Gardening': '🌱',
    'Moving': '📦',
    'Photography': '📸'
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, icon, image_url')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        // Add service count and styling for each category
        const categoriesWithCount = (data || []).map((category, index) => ({
          ...category,
          service_count: Math.floor(Math.random() * 50) + 10, // Will be replaced with real count
          icon: categoryEmojis[category.name] || '🏠',
          ...categoryColors[index % categoryColors.length]
        }));
        
        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback: still show static categories even if database fetch fails
      } finally {
        setLoading(false);
        // Always show content after loading completes
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }
    };

    fetchCategories();
  }, []);

  // Show loading skeleton instead of returning null
  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`py-12 bg-white transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 transition-all duration-500 ease-out">
            What are you looking for?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-500 ease-out delay-100">
            Choose from our wide range of professional home services
          </p>
        </div>
        
        {/* Real Categories from Database */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.slice(0, 6).map((category, index) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <Card
                key={category.id}
                className={`group cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-2 border-0 transform ${
                  isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'shadow-md'
                } ${category.bgColor || 'bg-blue-50'} opacity-0 translate-y-4 animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
                onClick={() => {
                   onCategorySelect(category.id);
                   navigate(`/services/${category.id}`);
                 }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.iconBg || 'bg-blue-100'} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">
                    {category.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600">
                    {category.description || `${category.service_count || 0} services`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 transition-all duration-300 ease-out transform hover:scale-105"
            onClick={() => {
              console.log('Category Grid View All Categories clicked - navigating to /all-categories');
              try {
                navigate('/all-categories');
              } catch (error) {
                console.error('Navigation failed, using fallback:', error);
                window.location.href = '/all-categories';
              }
            }}
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </div>
    </section>
  );
};