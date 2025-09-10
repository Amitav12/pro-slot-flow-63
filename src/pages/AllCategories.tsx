import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  service_count?: number;
}

const AllCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categoryEmojis: Record<string, string> = {
    'Automotive': '🚗',
    'Beauty & Personal Care': '💄',
    'Health & Wellness': '🏥',
    'Home Services': '🏠',
    'Sports': '⚽',
    'Technology': '💻',
    'Cleaning': '🧹',
    'Repairs & Maintenance': '🛠️',
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
        
        // Add service count for each category (mock for now)
        const categoriesWithCount = (data || []).map(category => ({
          ...category,
          service_count: Math.floor(Math.random() * 50) + 10
        }));
        
        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (category: Category) => {
    navigate(`/services/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`);
  };

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="container mx-auto px-6 py-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">
            All Service Categories
          </h1>
        </div>
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of professional services
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
              onClick={() => handleCategorySelect(category)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">
                    {categoryEmojis[category.name] || '🔧'}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>

                <Badge variant="secondary" className="mb-3">
                  {category.service_count} services
                </Badge>

                <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium mr-1">Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AllCategories;