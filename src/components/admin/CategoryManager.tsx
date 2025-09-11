
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight,
  DollarSign,
  Tag,
  Settings
} from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { Category, Subcategory, CreateCategoryData, CreateSubcategoryData } from '@/types/categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CategoryManager = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState<string | null>(null);

  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useCategories();
  const { subcategories, loading: subcategoriesLoading, createSubcategory, updateSubcategory, deleteSubcategory, toggleSubcategoryStatus } = useSubcategories();

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const CategoryForm = ({ category, onSave, onCancel }: {
    category: Partial<Category>;
    onSave: (category: CreateCategoryData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || 'home'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Dialog open={true} onOpenChange={() => onCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{category.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="home, car, heart, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {category.id ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const SubcategoryForm = ({ subcategory, categoryId, onSave, onCancel }: {
    subcategory: Partial<Subcategory>;
    categoryId: string;
    onSave: (subcategory: CreateSubcategoryData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      category_id: categoryId,
      name: subcategory.name || '',
      description: subcategory.description || '',
      min_price: subcategory.min_price || 0,
      max_price: subcategory.max_price || 1000
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.min_price >= formData.max_price) {
        alert('Minimum price must be less than maximum price');
        return;
      }
      onSave(formData);
    };

    return (
      <Dialog open={true} onOpenChange={() => onCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{subcategory.id ? 'Edit Subcategory' : 'Create New Subcategory'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Subcategory Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter subcategory name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter subcategory description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_price">Minimum Price ($)</Label>
                <Input
                  id="min_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_price">Maximum Price ($)</Label>
                <Input
                  id="max_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {subcategory.id ? 'Update' : 'Create'} Subcategory
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (categoriesLoading || subcategoriesLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-600">Manage service categories and subcategories with pricing controls</p>
        </div>
        <Button onClick={() => setIsCreatingCategory(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category Form Dialog */}
      {isCreatingCategory && (
        <CategoryForm
          category={{}}
          onSave={async (categoryData) => {
            await createCategory(categoryData);
            setIsCreatingCategory(false);
          }}
          onCancel={() => setIsCreatingCategory(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSave={async (categoryData) => {
            await updateCategory(editingCategory.id, categoryData);
            setEditingCategory(null);
          }}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {/* Subcategory Form Dialog */}
      {isCreatingSubcategory && (
        <SubcategoryForm
          subcategory={{}}
          categoryId={isCreatingSubcategory}
          onSave={async (subcategoryData) => {
            await createSubcategory(subcategoryData);
            setIsCreatingSubcategory(null);
          }}
          onCancel={() => setIsCreatingSubcategory(null)}
        />
      )}

      {editingSubcategory && (
        <SubcategoryForm
          subcategory={editingSubcategory}
          categoryId={editingSubcategory.category_id}
          onSave={async (subcategoryData) => {
            await updateSubcategory(editingSubcategory.id, subcategoryData);
            setEditingSubcategory(null);
          }}
          onCancel={() => setEditingSubcategory(null)}
        />
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categorySubcategories = getCategorySubcategories(category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Category Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {categorySubcategories.length} subcategories
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingSubcategory(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Subcategory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCategoryStatus(category.id, !category.is_active)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50">
                    {categorySubcategories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No subcategories yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreatingSubcategory(category.id)}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Subcategory
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {categorySubcategories.map((subcategory) => (
                          <Card key={subcategory.id} className="bg-white">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{subcategory.name}</h4>
                                    <p className="text-sm text-gray-600">{subcategory.description}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <span className="text-xs text-gray-500">
                                        Price Range: ${subcategory.min_price} - ${subcategory.max_price}
                                      </span>
                                      <Badge variant={subcategory.is_active ? "default" : "secondary"} className="text-xs">
                                        {subcategory.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingSubcategory(subcategory)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleSubcategoryStatus(subcategory.id, !subcategory.is_active)}
                                  >
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteSubcategory(subcategory.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Create your first service category to get started</p>
            <Button onClick={() => setIsCreatingCategory(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
