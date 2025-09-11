import { useState, useEffect } from 'react';
import { Category, Subcategory, CreateCategoryData, CreateSubcategoryData } from '@/types/categories';
import { categoriesService, subcategoriesService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      const data = await categoriesService.create(categoryData);
      setCategories(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<CreateCategoryData>) => {
    try {
      const data = await categoriesService.update(id, updates);
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleCategoryStatus = async (id: string, is_active: boolean) => {
    try {
      const data = await categoriesService.toggleStatus(id, is_active);
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Success",
        description: `Category ${is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update category status",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    refetch: fetchCategories
  };
};

export const useSubcategories = (categoryId?: string) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubcategories = async () => {
    try {
      const data = await subcategoriesService.getAll(categoryId);
      setSubcategories(data);
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subcategories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubcategory = async (subcategoryData: CreateSubcategoryData) => {
    try {
      const data = await subcategoriesService.create(subcategoryData);
      setSubcategories(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Subcategory created successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subcategory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSubcategory = async (id: string, updates: Partial<CreateSubcategoryData>) => {
    try {
      const data = await subcategoriesService.update(id, updates);
      setSubcategories(prev => prev.map(sub => sub.id === id ? data : sub));
      toast({
        title: "Success",
        description: "Subcategory updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      await subcategoriesService.delete(id);
      setSubcategories(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleSubcategoryStatus = async (id: string, is_active: boolean) => {
    try {
      const data = await subcategoriesService.toggleStatus(id, is_active);
      setSubcategories(prev => prev.map(sub => sub.id === id ? data : sub));
      toast({
        title: "Success",
        description: `Subcategory ${is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling subcategory status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory status",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  return {
    subcategories,
    loading,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
    refetch: fetchSubcategories
  };
};