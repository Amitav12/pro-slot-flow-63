import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  User, 
  Menu,
  X,
  Plus,
  Clock,
  MapPin,
  Star,
  Phone,
  Mail,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  location: string;
  provider_phone?: string;
}

interface Favorite {
  id: string;
  service_id: string;
  service_name: string;
  provider_name: string;
  category: string;
  rating: number;
  price_range: string;
  location: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  created_at: string;
}

const ProfessionalCustomerDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    totalFavorites: 0,
    totalSpent: 0
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/customer?section=dashboard' },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, path: '/customer?section=bookings' },
    { id: 'profile', label: 'Profile', icon: User, path: '/customer?section=profile' },
  ];

  // Set active section based on current path or query parameter
  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    
    if (section) {
      setActiveSection(section);
    } else if (path.includes('/bookings')) {
      setActiveSection('bookings');
    } else if (path.includes('/profile')) {
      setActiveSection('profile');
    } else {
      setActiveSection('dashboard');
    }
  }, [location.pathname, location.search]);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadBookings(),
        loadUserProfile(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      // Type-safe data handling with proper transformation
      const bookingsData = (data || []).map((order: any) => ({
        id: order.id,
        service_name: order.service_name || 'Unknown Service',
        provider_name: order.provider_name || 'Unknown Provider',
        booking_date: order.booking_date,
        booking_time: order.booking_time,
        status: order.status || 'pending',
        total_amount: order.total_amount || 0,
        location: order.customer_address || 'Not specified',
        provider_phone: order.customer_phone || null
      }));
      setBookings(bookingsData);
      
      // Calculate stats
      const activeBookings = bookingsData.filter((b: any) => b.status === 'confirmed' || b.status === 'pending').length;
      const completedBookings = bookingsData.filter((b: any) => b.status === 'completed').length;
      const totalSpent = bookingsData
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      setStats(prev => ({
        ...prev,
        activeBookings,
        completedBookings,
        totalSpent
      }));
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };


  const loadUserProfile = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      // Type-safe data handling with proper transformation
      const profileRecord = data as any;
      const profileData = {
        id: profileRecord.id,
        full_name: profileRecord.full_name || user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        phone: profileRecord.phone || '',
        address: profileRecord.address || '',
        city: '', // city column doesn't exist in current schema
        created_at: profileRecord.created_at
      };
      
      setUserProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      const defaultProfile = {
        id: user?.id || 'temp',
        full_name: user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        created_at: new Date().toISOString()
      };
      setUserProfile(defaultProfile);
      setProfileForm({
        full_name: defaultProfile.full_name,
        phone: defaultProfile.phone,
        address: defaultProfile.address,
        city: defaultProfile.city
      });
    }
  };

  const updateProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user session found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // First, ensure the user exists in the user_profiles table
      const { data: existingProfile, error: checkError } = await (supabase as any)
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected for new profiles
        throw checkError;
      }

      // Use upsert to create or update the profile (only with existing columns)
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          address: profileForm.address,
          // city: profileForm.city, // city column doesn't exist in current schema
          role: 'customer',
          // auth_role: 'customer', // auth_role column doesn't exist in current schema
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      setIsEditingProfile(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "Success",
        description: "Removed from favorites"
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.full_name || user?.user_metadata?.full_name || 'Customer'}!</h1>
              <p className="text-blue-100 text-lg">Manage your bookings and discover amazing services</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Active Bookings</p>
                <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.activeBookings}</p>
                <p className="text-emerald-600 text-sm mt-1">Upcoming services</p>
              </div>
              <div className="bg-emerald-500 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.completedBookings}</p>
                <p className="text-blue-600 text-sm mt-1">Services completed</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium uppercase tracking-wide">Total Spent</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">${stats.totalSpent}</p>
                <p className="text-purple-600 text-sm mt-1">This year</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Bookings</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveSection('bookings');
                navigate('/dashboard/bookings');
              }}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.service_name}</h4>
                      <p className="text-gray-600 text-sm">{booking.provider_name}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(booking.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </Badge>
                    <p className="text-lg font-bold text-gray-900 mt-1">${booking.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start exploring services to make your first booking</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Browse Services
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage your service appointments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Book Service
        </Button>
      </div>
      
      {bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{booking.service_name}</h3>
                      <p className="text-gray-600 font-medium">{booking.provider_name}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.location}
                        </div>
                        {booking.provider_phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {booking.provider_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <Badge className={`${getStatusColor(booking.status)} border px-3 py-1`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize font-medium">{booking.status}</span>
                      </div>
                    </Badge>
                    <p className="text-2xl font-bold text-gray-900">${booking.total_amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start exploring our amazing services to make your first booking and experience quality service delivery.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Favorites</h2>
          <p className="text-gray-600">Your saved services and providers</p>
        </div>
      </div>
      
      {favorites.length > 0 ? (
        <div className="grid gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{favorite.service_name}</h3>
                      <p className="text-gray-600 font-medium">{favorite.provider_name}</p>
                      <p className="text-sm text-gray-500 mb-3">{favorite.category}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{favorite.rating}</span>
                        </div>
                        <span className="text-gray-500">{favorite.price_range}</span>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {favorite.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => removeFavorite(favorite.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Heart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Save services you love to find them easily later and book them with just one click.</p>
            <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg">
              <Search className="h-4 w-4 mr-2" />
              Discover Services
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        {!isEditingProfile && (
          <Button 
            onClick={() => setIsEditingProfile(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          {isEditingProfile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="city"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                <Input
                  id="address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={updateProfile} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                    {userProfile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{userProfile?.full_name || 'User'}</h3>
                  <p className="text-gray-600">Customer since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contact Information</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{userProfile?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{userProfile?.phone || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{userProfile?.city || 'Not set'}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <span className="text-gray-900">{userProfile?.address || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'bookings': return renderBookings();
      case 'favorites': return renderFavorites();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* FIXED LAYOUT - NO OVERLAP */}
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on Mobile, Static on Desktop */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 
          bg-white shadow-xl lg:shadow-none border-r border-gray-200
          transform transition-transform duration-300 ease-in-out lg:transform-none
          flex flex-col h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Pro Slot Flow</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 flex-shrink-0">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    navigate(`/customer?section=${item.id}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Spacer to push user section to bottom */}
        <div className="flex-1"></div>
        
        {/* User section - Fixed at bottom with proper spacing */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {(userProfile?.full_name || user?.user_metadata?.full_name || user?.email)?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.full_name || user?.user_metadata?.full_name || 'Customer'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              try {
                await signOut();
                navigate('/');
              } catch (error) {
                console.error('Sign out error:', error);
                toast({
                  title: "Error",
                  description: "Failed to sign out. Please try again.",
                  variant: "destructive"
                });
              }
            }}
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-3 py-2 text-sm rounded-md"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {activeSection}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {activeSection === 'dashboard' && 'Overview of your account'}
                    {activeSection === 'bookings' && 'Manage your service appointments'}
                    {activeSection === 'favorites' && 'Your saved services'}
                    {activeSection === 'profile' && 'Account settings and information'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm text-gray-600">
                  Customer Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto w-full">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCustomerDashboard;