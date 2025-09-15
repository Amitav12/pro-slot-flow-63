import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  min_price: number;
  max_price: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const SubcategorySelection: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!category) return;

      try {
        setLoading(true);
        
        // First get the category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, description')
          .eq('id', category)
          .maybeSingle();

        if (categoryError) throw categoryError;
        setCategoryInfo(categoryData);

        // Fetch subcategories for this category
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('id, name, description, min_price, max_price, category_id')
          .eq('category_id', category)
          .eq('is_active', true)
          .order('name');

        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData || []);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        toast({
          title: "Error loading subcategories",
          description: "Failed to load subcategories for this category",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [category]);

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleNext = () => {
    if (!selectedSubcategory) {
      toast({
        title: "Please select a subcategory",
        variant: "destructive"
      });
      return;
    }
    
    const selectedSubcategoryData = subcategories.find(s => s.id === selectedSubcategory);
    navigate(`/services/${category}/${selectedSubcategory}`, { 
      state: { 
        categoryId: category,
        categoryName: categoryInfo?.name,
        subcategoryId: selectedSubcategory,
        subcategoryName: selectedSubcategoryData?.name
      } 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {categoryInfo?.name ? `${categoryInfo.name} Services` : 'Select Service Type'}
                </h1>
                <p className="text-muted-foreground">
                  Choose the specific type of service you need
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No subcategories found for this category.
              </p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-4"
                variant="outline"
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {subcategories.map((subcategory) => (
                  <Card 
                    key={subcategory.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedSubcategory === subcategory.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-foreground">
                          {subcategory.name}
                        </h3>
                        {selectedSubcategory === subcategory.id && (
                          <Badge className="bg-primary text-primary-foreground">
                            ✓ Selected
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4">
                        {subcategory.description || 'Professional service'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Price range: ${subcategory.min_price} - ${subcategory.max_price}
                        </div>
                        <Button
                          size="sm"
                          variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategorySelect(subcategory.id);
                          }}
                        >
                          {selectedSubcategory === subcategory.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Button */}
              {selectedSubcategory && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40" style={{ paddingRight: '120px' }}>
                  <div className="container mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Service type selected
                        </p>
                        <p className="font-semibold">
                          {subcategories.find(s => s.id === selectedSubcategory)?.name}
                        </p>
                      </div>
                      <Button onClick={handleNext} size="lg" className="px-8">
                        Next: View Services
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubcategorySelection;