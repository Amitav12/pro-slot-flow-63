import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SpecialOffersManager from './SpecialOffersManager';
import { PlatformFeesManager } from './PlatformFeesManager';
import { TaxSlabsManager } from './TaxSlabsManager';
import { Gift, DollarSign, Calculator, TrendingUp } from 'lucide-react';

export default function SpecialOffersHub() {
  const [activeTab, setActiveTab] = useState('offers');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Special Offers Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage offers, platform fees, and tax configurations for your platform
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          Revenue Management
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Special Offers
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Platform Fees
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Tax Slabs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Special Offers & Coupons
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage discount offers, coupon codes, and promotional campaigns
              </p>
            </CardHeader>
            <CardContent>
              <SpecialOffersManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Platform Fees Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up service fees, processing charges, and other platform-related costs
              </p>
            </CardHeader>
            <CardContent>
              <PlatformFeesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Tax Slabs Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure tax percentages and slabs that will be applied to the total amount
              </p>
            </CardHeader>
            <CardContent>
              <TaxSlabsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}