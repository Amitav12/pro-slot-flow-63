import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Construction } from 'lucide-react';

export const ProviderRegistration: React.FC = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="h-5 w-5" />
          Provider Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <Construction className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Provider registration system is being updated...</p>
          <Badge variant="secondary">Feature Under Development</Badge>
          <p className="text-sm mt-4">
            Please contact support for provider registration assistance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};