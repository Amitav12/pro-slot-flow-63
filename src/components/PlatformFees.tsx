import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlatformFee {
  id: string;
  fee_type: 'percentage' | 'fixed_amount';
  fee_value: number;
  minimum_fee?: number;
  maximum_fee?: number;
  description?: string;
  is_active: boolean;
}

interface PlatformFeesProps {
  subtotal: number;
  onFeesCalculated: (fees: number) => void;
}

export const PlatformFees: React.FC<PlatformFeesProps> = ({
  subtotal,
  onFeesCalculated
}) => {
  const [platformFee, setPlatformFee] = useState<PlatformFee | null>(null);
  const [calculatedFee, setCalculatedFee] = useState(0);

  useEffect(() => {
    loadPlatformFees();
  }, []);

  useEffect(() => {
    if (platformFee && subtotal > 0) {
      const fee = calculateFee(subtotal, platformFee);
      setCalculatedFee(fee);
      onFeesCalculated(fee);
    } else {
      setCalculatedFee(0);
      onFeesCalculated(0);
    }
  }, [subtotal, platformFee, onFeesCalculated]);

  const loadPlatformFees = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_fees')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading platform fees:', error);
        return;
      }

      if (data) {
        setPlatformFee(data);
      }
    } catch (error) {
      console.error('Error loading platform fees:', error);
    }
  };

  const calculateFee = (amount: number, fee: PlatformFee): number => {
    let calculatedFee = 0;

    if (fee.fee_type === 'percentage') {
      calculatedFee = amount * (fee.fee_value / 100);
    } else {
      calculatedFee = fee.fee_value;
    }

    // Apply minimum fee limit
    if (fee.minimum_fee && calculatedFee < fee.minimum_fee) {
      calculatedFee = fee.minimum_fee;
    }

    // Apply maximum fee limit
    if (fee.maximum_fee && calculatedFee > fee.maximum_fee) {
      calculatedFee = fee.maximum_fee;
    }

    return Math.round(calculatedFee * 100) / 100; // Round to 2 decimal places
  };

  const getFeeDescription = () => {
    if (!platformFee) return 'Platform service fee';
    
    if (platformFee.description) {
      return platformFee.description;
    }

    if (platformFee.fee_type === 'percentage') {
      return `${platformFee.fee_value}% platform service fee`;
    } else {
      return `$${platformFee.fee_value} platform service fee`;
    }
  };

  const getFeeTooltipContent = () => {
    if (!platformFee) return 'Platform service fee for processing your booking';
    
    let content = getFeeDescription();
    
    if (platformFee.fee_type === 'percentage') {
      content += ` (${platformFee.fee_value}% of subtotal)`;
      
      if (platformFee.minimum_fee) {
        content += `. Minimum fee: $${platformFee.minimum_fee}`;
      }
      
      if (platformFee.maximum_fee) {
        content += `. Maximum fee: $${platformFee.maximum_fee}`;
      }
    }
    
    return content;
  };

  if (!platformFee || calculatedFee === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Platform Fee</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{getFeeTooltipContent()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <span className="font-semibold text-lg">${calculatedFee.toFixed(2)}</span>
    </div>
  );
};