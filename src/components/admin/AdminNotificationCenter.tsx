import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export const AdminNotificationCenter: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Notification center coming soon...</p>
          <Badge variant="secondary">Feature Under Development</Badge>
        </div>
      </CardContent>
    </Card>
  );
};