
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerProfile } from '@/components/customer/CustomerProfile';
import { 
  User, 
  MapPin, 
  Settings,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  Camera,
  Edit
} from 'lucide-react';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', active: true },
    { icon: MapPin, label: 'Addresses' },
    { icon: CreditCard, label: 'Payment Methods' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: Settings, label: 'Account Settings' },
    { icon: LogOut, label: 'Sign Out', onClick: handleSignOut, isSignOut: true }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      item.active
                        ? 'bg-primary/10 text-primary'
                        : item.isSignOut
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {profile?.role || 'Customer'} Account
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Customer Profile */}
          <CustomerProfile />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">4.8</div>
                <div className="text-sm text-gray-600">Avg Rating Given</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
