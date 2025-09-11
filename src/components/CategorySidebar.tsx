import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category_id: string;
}

interface CategorySidebarProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  onSubcategorySelect: (subcategoryId: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) throw categoriesError;

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (subcategoriesError) throw subcategoriesError;

        // Group subcategories by category
        const categoriesWithSubs = categoriesData.map(category => ({
          ...category,
          subcategories: subcategoriesData.filter(sub => sub.category_id === category.id)
        }));

        setCategories(categoriesWithSubs);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-card border-r border-border h-full">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Service Categories
        </h2>
        
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <Card 
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                  selectedCategory === category.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {category.name}
                      </p>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {category.subcategories.length} services
                        </Badge>
                      )}
                    </div>
                  </div>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="text-muted-foreground">
                      {expandedCategory === category.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Subcategories */}
              {expandedCategory === category.id && category.subcategories && (
                <div className="ml-4 space-y-1 animate-fade-in">
                  {category.subcategories.map((subcategory) => (
                    <Card
                      key={subcategory.id}
                      className={`p-2 cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                        selectedSubcategory === subcategory.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => onSubcategorySelect(subcategory.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {subcategory.image_url ? (
                          <img 
                            src={subcategory.image_url} 
                            alt={subcategory.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">
                              {subcategory.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-foreground">
                          {subcategory.name}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};