import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Settings, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2, 
  Trash2, 
  Search, 
  Eye,
  Crown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { AdminPermissionsPanel } from './AdminPermissionsPanel';

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface AdminPermission {
  id: string;
  section: string;
  display_name: string;
  is_enabled: boolean;
  description?: string;
}

export const AdminManager = () => {
  const { toast } = useToast();
  const { isRole } = useAuth();
  const { updatePermission } = useAdminPermissions();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  // Fetch admin users (admin + super_admin roles)
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('auth_role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminUser[];
    }
  });

  // Set up real-time subscriptions for admin users
  useEffect(() => {
    const subscription = supabase
      .channel('admin_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: 'auth_role=in.(admin,super_admin)'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch admin permissions
  const { data: adminPermissions } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as AdminPermission[];
    }
  });

  // Set up real-time subscriptions for permissions
  useEffect(() => {
    const subscription = supabase
      .channel('admin_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_permissions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Update admin mutation
  const updateAdminMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<AdminUser> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates.data)
        .eq('id', updates.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "Admin user updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin user",
        variant: "destructive",
      });
    }
  });

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "Admin user deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete admin user",
        variant: "destructive",
      });
    }
  });

  // Promote user to admin mutation
  const promoteToAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; role: 'admin' | 'super_admin' }) => {
      const { error } = await supabase
        .rpc('promote_user_role', {
          user_uuid: data.userId,
          new_role: data.role
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'super_admin' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />;
  };

  // Event handlers
  const handleBlockToggle = (adminId: string, blocked: boolean) => {
    updateAdminMutation.mutate({
      id: adminId,
      data: { is_blocked: blocked }
    });
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditForm({
      full_name: admin.full_name || '',
      phone: admin.phone || '',
      address: admin.address || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingAdmin) return;

    updateAdminMutation.mutate({
      id: editingAdmin.id,
      data: editForm
    });

    setEditingAdmin(null);
  };

  const handleDeleteAdmin = (adminId: string) => {
    deleteAdminMutation.mutate(adminId);
  };

  // Filter admins based on search term
  const filteredAdmins = adminUsers?.filter(admin =>
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Statistics
  const stats = {
    total: adminUsers?.length || 0,
    superAdmins: adminUsers?.filter(a => a.role === 'super_admin').length || 0,
    regularAdmins: adminUsers?.filter(a => a.role === 'admin').length || 0,
    blocked: adminUsers?.filter(a => a.is_blocked).length || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-muted-foreground">Manage system administrators and their permissions</p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search admins by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.superAdmins}</p>
                <p className="text-sm text-muted-foreground">Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.regularAdmins}</p>
                <p className="text-sm text-muted-foreground">Regular Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Admin List */}
      <div className="space-y-4">
        {filteredAdmins?.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Admin Info */}
                <div className="lg:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      admin.role === 'super_admin' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      <span className="text-white font-bold">
                        {admin.full_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{admin.full_name || 'Unnamed Admin'}</h3>
                      <Badge className={`${getRoleColor(admin.role)} border`}>
                        {getRoleIcon(admin.role)}
                        <span className="ml-1">{admin.role.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined {new Date(admin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-4 space-y-1">
                  {admin.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>User ID: {admin.user_id.substring(0, 8)}...</span>
                  </div>
                  {admin.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Address:</strong> {admin.address}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="lg:col-span-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`blocked-${admin.id}`}
                        checked={admin.is_blocked}
                        onCheckedChange={(checked) => handleBlockToggle(admin.id, checked)}
                        disabled={admin.role === 'super_admin'} // Can't block super admin
                      />
                      <Label htmlFor={`blocked-${admin.id}`} className="text-sm">
                        {admin.is_blocked ? 'Blocked' : 'Active'}
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAdmin(admin)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Permissions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAdmin(admin)}
                        className="text-green-600 border-green-300 hover:bg-green-50 flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {admin.is_blocked ? (
                        <Button
                          size="sm"
                          onClick={() => handleBlockToggle(admin.id, false)}
                          className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                          disabled={admin.role === 'super_admin'}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockToggle(admin.id, true)}
                          className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                          disabled={admin.role === 'super_admin'}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Block
                        </Button>
                      )}
                      {admin.role !== 'super_admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the admin account and revoke all administrative privileges.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Permissions Dialog */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Permissions - {selectedAdmin?.full_name}
            </DialogTitle>
            <DialogDescription>
              {isRole('super_admin') 
                ? `Manage system permissions for this admin user. Toggle permissions to control access to different sections.`
                : `View the current system permissions for this admin user. Only Super Admins can modify these permissions.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAdmin?.role === 'super_admin' ? (
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Super Admin Access</h3>
                <p className="text-muted-foreground">
                  Super Admins have full access to all sections and cannot have permissions modified.
                </p>
              </div>
            ) : isRole('super_admin') ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Manage System Permissions</h3>
                  <p className="text-muted-foreground">
                    Control which sections this admin can access. Changes apply system-wide for all admin users.
                  </p>
                </div>
                <AdminPermissionsPanel />
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Permission Access</h3>
                <p className="text-muted-foreground">
                  Only Super Admins can view and modify admin permissions.
                </p>
              </div>
            )}
            <div className="text-sm text-gray-500 italic">
              * Super Admin users have access to all sections regardless of these settings
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAdmin(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>
              Update admin user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAdmin(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};