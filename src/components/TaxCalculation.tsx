import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TaxSlab {
  id: string;
  name: string;
  tax_percentage: number;
  minimum_amount: number;
  maximum_amount: number | null;
  is_active: boolean;
  applies_to?: string;
  description?: string;
}

interface TaxCalculationProps {
  subtotal: number;
  onTaxCalculated: (taxAmount: number, taxDetails: { slab: TaxSlab; calculatedTax: number } | null) => void;
}

export function TaxCalculation({ subtotal, onTaxCalculated }: TaxCalculationProps) {
  const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicableTax, setApplicableTax] = useState<{ slab: TaxSlab; calculatedTax: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTaxSlabs();
  }, []);

  useEffect(() => {
    if (taxSlabs.length > 0 && subtotal > 0) {
      calculateApplicableTax();
    } else {
      setApplicableTax(null);
      onTaxCalculated(0, null);
    }
  }, [taxSlabs, subtotal]);

  const loadTaxSlabs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tax_slabs')
        .select('*')
        .eq('is_active', true)
        .order('minimum_amount', { ascending: true });

      if (error) {
        console.error('Error loading tax slabs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tax configuration',
          variant: 'destructive',
        });
        return;
      }

      setTaxSlabs(data || []);
    } catch (error) {
      console.error('Error loading tax slabs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateApplicableTax = () => {
    // Find the applicable tax slab based on subtotal
    const applicableSlab = taxSlabs.find(slab => {
      const meetsMinimum = subtotal >= slab.minimum_amount;
      const meetsMaximum = slab.maximum_amount === null || subtotal <= slab.maximum_amount;
      return meetsMinimum && meetsMaximum;
    });

    if (applicableSlab) {
      const calculatedTax = (subtotal * applicableSlab.tax_percentage) / 100;
      const taxDetails = { slab: applicableSlab, calculatedTax };
      setApplicableTax(taxDetails);
      onTaxCalculated(calculatedTax, taxDetails);
    } else {
      setApplicableTax(null);
      onTaxCalculated(0, null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading tax information...</span>
      </div>
    );
  }

  if (!applicableTax) {
    return (
      <div className="flex items-center justify-between py-2 text-sm text-gray-600">
        <span className="flex items-center">
          <Calculator className="w-4 h-4 mr-2" />
          Tax
        </span>
        <span>No tax applicable</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <Calculator className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-sm font-medium">Tax ({applicableTax.slab.tax_percentage}%)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 ml-1 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">{applicableTax.slab.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Applies to amounts: ${applicableTax.slab.minimum_amount.toFixed(2)}
                    {applicableTax.slab.maximum_amount && ` - $${applicableTax.slab.maximum_amount.toFixed(2)}`}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center">
          <Badge variant="secondary" className="mr-2 text-xs">
            {applicableTax.slab.name}
          </Badge>
          <span className="text-sm font-medium">
            ${applicableTax.calculatedTax.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Tax breakdown for transparency */}
      <div className="text-xs text-gray-500 pl-6">
        ${subtotal.toFixed(2)} × {applicableTax.slab.tax_percentage}% = ${applicableTax.calculatedTax.toFixed(2)}
      </div>
    </div>
  );
}

export default TaxCalculation;