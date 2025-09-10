
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Shield, Bell, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CustomerProfile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || user?.user_metadata?.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || ''
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          role: 'customer',
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setIsEditing(false);
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
    setFormData({
      fullName: profile?.full_name || user?.user_metadata?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || ''
    });
    setIsEditing(false);
  };

  const accountStats = [
    { label: 'Member Since', value: 'January 2024', icon: Calendar },
    { label: 'Total Bookings', value: '24', icon: Calendar },
    { label: 'Favorite Services', value: '8', icon: User },
    { label: 'Account Status', value: 'Verified', icon: Shield, status: 'verified' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {formData.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {formData.fullName || 'User'}
              </h3>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              <div className="flex justify-center mb-6">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Account
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                {accountStats.map((stat) => (
                  <div key={stat.label} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="pl-10"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {formData.fullName || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                      {user?.email || 'Not available'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="pl-10"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {formData.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                    City
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="pl-10"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {formData.city || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows={3}
                      className="pl-10 resize-none"
                      placeholder="Enter your full address"
                    />
                  ) : (
                    <div className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[100px] flex items-start pt-3">
                      {formData.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Booking Updates</p>
                  <p className="text-sm text-gray-500">Get notified about booking status changes</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Promotions</p>
                  <p className="text-sm text-gray-500">Receive special offers and discounts</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Default Payment</p>
                  <p className="text-sm text-gray-500">Manage your payment methods</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Billing History</p>
                  <p className="text-sm text-gray-500">View past transactions</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
