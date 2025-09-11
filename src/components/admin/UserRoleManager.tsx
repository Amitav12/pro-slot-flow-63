import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Crown, 
  Shield, 
  User, 
  UserCheck, 
  Search, 
  MoreHorizontal,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    auth_role: UserRole;
    business_name: string | null;
    phone: string | null;
    onboarding_completed: boolean;
  } | null;
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  customer: <User className="h-4 w-4" />,
  provider: <UserCheck className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  super_admin: <Crown className="h-4 w-4" />,
};

const roleColors: Record<UserRole, string> = {
  customer: 'default',
  provider: 'secondary',
  admin: 'destructive',
  super_admin: 'default',
};

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [promotingUser, setPromotingUser] = useState<string | null>(null);
  const { isRole } = useAuth();
  const { toast } = useToast();

  // Only Super Admin can access this component
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

  // Fetch all users with their profiles
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get all users from auth.users (this requires service role key in production)
      // For now, we'll get users through their profiles
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          auth_role,
          business_name,
          phone,
          onboarding_completed,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const usersWithProfiles: UserWithProfile[] = profiles.map((profile: any) => ({
        id: profile.user_id,
        email: `user-${profile.user_id.slice(0, 8)}@example.com`, // Placeholder since we can't access auth.users
        created_at: profile.created_at,
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          auth_role: profile.auth_role,
          business_name: profile.business_name,
          phone: profile.phone,
          onboarding_completed: profile.onboarding_completed,
        }
      }));

      setUsers(usersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Promote user role
  const promoteUser = async (userId: string, newRole: UserRole) => {
    try {
      setPromotingUser(userId);

      // Call the promote_user_role function
      const { error } = await (supabase as any)
        .rpc('promote_user_role', {
          user_uuid: userId,
          new_role: newRole
        });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId && user.profile
          ? {
              ...user,
              profile: {
                ...user.profile,
                auth_role: newRole
              }
            }
          : user
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setPromotingUser(null);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.profile?.auth_role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="h-5 w-5 mr-2" />
          User Role Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. Only Super Admin can modify user roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | 'all')}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.profile?.full_name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={roleColors[user.profile?.auth_role || 'customer'] as any}
                      className="flex items-center w-fit"
                    >
                      {roleIcons[user.profile?.auth_role || 'customer']}
                      <span className="ml-1 capitalize">
                        {user.profile?.auth_role?.replace('_', ' ') || 'customer'}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.profile?.business_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.profile?.onboarding_completed ? "default" : "secondary"}>
                      {user.profile?.onboarding_completed ? "Complete" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <RoleChangeDialog
                      user={user}
                      onRoleChange={promoteUser}
                      isUpdating={promotingUser === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">User Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{users.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Customers:</span>
              <span className="ml-2 font-medium">
                {users.filter(u => u.profile?.auth_role === 'customer').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Providers:</span>
              <span className="ml-2 font-medium">
                {users.filter(u => u.profile?.auth_role === 'provider').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Admins:</span>
              <span className="ml-2 font-medium">
                {users.filter(u => u.profile?.auth_role === 'admin').length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Role Change Dialog Component
const RoleChangeDialog: React.FC<{
  user: UserWithProfile;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  isUpdating: boolean;
}> = ({ user, onRoleChange, isUpdating }) => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.profile?.auth_role || 'customer');

  const handleRoleChange = async () => {
    await onRoleChange(user.id, selectedRole);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.profile?.full_name || 'this user'}. 
            This will immediately change their access permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Role</label>
            <div className="mt-1">
              <Badge variant={roleColors[user.profile?.auth_role || 'customer'] as any}>
                {roleIcons[user.profile?.auth_role || 'customer']}
                <span className="ml-1 capitalize">
                  {user.profile?.auth_role?.replace('_', ' ') || 'customer'}
                </span>
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer
                  </div>
                </SelectItem>
                <SelectItem value="provider">
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Provider
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="super_admin">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 mr-2" />
                    Super Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'super_admin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Super Admin role grants full system access 
                  and the ability to manage all other users.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChange}
            disabled={selectedRole === user.profile?.auth_role}
          >
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};