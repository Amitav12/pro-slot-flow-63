import React, { useState } from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  MapPin, 
  CreditCard, 
  Bell,
  UserCheck,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Icon mapping for different sections
const sectionIcons: Record<string, React.ReactNode> = {
  users: <Users className="h-4 w-4" />,
  providers: <UserCheck className="h-4 w-4" />,
  services: <Package className="h-4 w-4" />,
  bookings: <Calendar className="h-4 w-4" />,
  categories: <Package className="h-4 w-4" />,
  locations: <MapPin className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

export const AdminPermissionsPanel: React.FC = () => {
  const { isRole } = useAuth();
  const { 
    permissions, 
    loading, 
    updatePermission, 
    enableAll, 
    disableAll 
  } = useAdminPermissions();
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Only Super Admin can see this panel
  if (!isRole('super_admin')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Shield className="h-8 w-8 mr-2" />
            <span>Access Denied - Super Admin Only</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePermissionToggle = async (id: string, currentValue: boolean) => {
    setUpdating(id);
    await updatePermission(id, !currentValue);
    setUpdating(null);
  };

  const handleEnableAll = async () => {
    setBulkUpdating(true);
    await enableAll();
    setBulkUpdating(false);
  };

  const handleDisableAll = async () => {
    setBulkUpdating(true);
    await disableAll();
    setBulkUpdating(false);
  };

  const enabledCount = permissions.filter(p => p.is_enabled).length;
  const totalCount = permissions.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Permissions Management
          </div>
          <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
            {enabledCount}/{totalCount} Enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Control which dashboard sections are accessible to Admin users. 
          Super Admin always has full access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnableAll}
            disabled={bulkUpdating || enabledCount === totalCount}
          >
            {bulkUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisableAll}
            disabled={bulkUpdating || enabledCount === 0}
          >
            {bulkUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Disable All
          </Button>
        </div>

        <Separator />

        {/* Permission List */}
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {sectionIcons[permission.section] || <Package className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{permission.display_name}</h4>
                    <Badge 
                      variant={permission.is_enabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {permission.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  {permission.description && (
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Section: <code className="bg-muted px-1 rounded">{permission.section}</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {updating === permission.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Switch
                  checked={permission.is_enabled}
                  onCheckedChange={() => handlePermissionToggle(permission.id, permission.is_enabled)}
                  disabled={updating === permission.id}
                />
              </div>
            </div>
          ))}
        </div>

        {permissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No admin permissions configured</p>
          </div>
        )}

        <Separator />

        {/* Info Section */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Permission System Info
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Super Admin:</strong> Always has access to all sections</li>
            <li>• <strong>Admin:</strong> Only sees enabled sections in their dashboard</li>
            <li>• <strong>Provider/Customer:</strong> Not affected by these permissions</li>
            <li>• Changes take effect immediately for all Admin users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};