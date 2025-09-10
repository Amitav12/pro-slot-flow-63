import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  zip_code: string;
  home_address: string;
  nearby_address: string;
}

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: 'United States',
    state: '',
    zip_code: '',
    home_address: '',
    nearby_address: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const profileData = {
        id: data.id,
        full_name: data.full_name || user.user_metadata?.full_name || '',
        phone: data.phone || '',
        country: data.country || 'United States',
        state: data.state || '',
        zip_code: data.zip_code || '',
        home_address: data.home_address || '',
        nearby_address: data.nearby_address || ''
      };

      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          country: formData.country,
          state: formData.state,
          zip_code: formData.zip_code,
          home_address: formData.home_address,
          nearby_address: formData.nearby_address,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...formData, id: profile?.id || '' });
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-600">Manage your account information</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                {(formData.full_name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{formData.full_name || 'User'}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                placeholder="Email (cannot be changed)"
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your country"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your state or province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip/Postal Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your zip or postal code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="home_address">Home Address</Label>
              <Input
                id="home_address"
                value={formData.home_address}
                onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your complete home address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nearby_address">Nearby Address/Landmark</Label>
              <Input
                id="nearby_address"
                value={formData.nearby_address}
                onChange={(e) => setFormData({ ...formData, nearby_address: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter nearby landmarks or alternative address"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};