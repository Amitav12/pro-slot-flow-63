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
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

const DatabaseCustomerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, path: '/dashboard/bookings' },
    { id: 'favorites', label: 'Favorites', icon: Heart, path: '/dashboard/favorites' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  // Set active section based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/bookings')) setActiveSection('bookings');
    else if (path.includes('/favorites')) setActiveSection('favorites');
    else if (path.includes('/profile')) setActiveSection('profile');
    else setActiveSection('dashboard');
  }, [location.pathname]);

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
        loadFavorites(),
        loadUserProfile(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('bookings')
        .select(`
          id,
          service_name,
          provider_name,
          booking_date,
          booking_time,
          status,
          total_amount,
          location,
          provider_phone
        `)
        .eq('customer_id' as any, user?.id as any)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings((data as any) || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Create sample data if table doesn't exist
      setBookings([
        {
          id: '1',
          service_name: 'House Cleaning',
          provider_name: 'Clean Pro Services',
          booking_date: '2024-03-15',
          booking_time: '10:00',
          status: 'confirmed',
          total_amount: 150,
          location: 'New York, NY',
          provider_phone: '+1-555-0123'
        }
      ]);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_favorites' as any)
        .select(`
          id,
          service_id,
          service_name,
          provider_name,
          category,
          rating,
          price_range,
          location
        `)
        .eq('customer_id' as any, user?.id as any);

      if (error) throw error;
      setFavorites((data as any) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Create sample data if table doesn't exist
      setFavorites([
        {
          id: '1',
          service_id: 'service-1',
          service_name: 'Premium Car Wash',
          provider_name: 'Auto Shine',
          category: 'Automotive',
          rating: 4.8,
          price_range: '$50-$80',
          location: 'Downtown'
        }
      ]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id' as any, user?.id as any)
        .single();

      if (error) throw error;
      
      const profileData = {
        id: (data as any).id,
        full_name: (data as any).full_name || user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        phone: (data as any).phone || '',
        address: (data as any).address || '',
        city: (data as any).city || '',
        created_at: (data as any).created_at
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
      // Create default profile
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

  const loadStats = async () => {
    try {
      // Calculate stats from bookings
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const totalSpent = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_amount, 0);

      setStats({
        activeBookings,
        completedBookings,
        totalFavorites: favorites.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
      setStats({
        activeBookings: 1,
        completedBookings: 5,
        totalFavorites: 3,
        totalSpent: 750
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
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
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('customer_favorites' as any)
        .delete()
        .eq('id' as any, favoriteId as any);

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
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile?.full_name || 'User'}!</h2>
        <p className="text-blue-100">Manage your bookings and discover amazing services</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Upcoming services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">Services completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">Saved services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{booking.service_name}</h4>
                    <p className="text-sm text-gray-600">{booking.provider_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">${booking.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <Button onClick={() => navigate('/services')}>
          <Plus className="h-4 w-4 mr-2" />
          Book Service
        </Button>
      </div>
      
      {bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                    <p className="text-gray-600">{booking.provider_name}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.location}
                    </div>
                    {booking.provider_phone && (
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        {booking.provider_phone}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <p className="text-lg font-bold mt-2">${booking.total_amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start exploring services to make your first booking</p>
            <Button onClick={() => navigate('/services')}>Browse Services</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Favorites</h2>
      
      {favorites.length > 0 ? (
        <div className="grid gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{favorite.service_name}</h3>
                    <p className="text-gray-600">{favorite.provider_name}</p>
                    <p className="text-sm text-gray-500">{favorite.category}</p>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{favorite.rating}</span>
                      <span className="text-sm text-gray-500 ml-2">{favorite.price_range}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {favorite.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => navigate(`/services/${favorite.service_id}`)}>
                      Book Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => removeFavorite(favorite.id)}
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
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-4">Save services you love to find them easily later</p>
            <Button onClick={() => navigate('/services')}>Discover Services</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        {!isEditingProfile && (
          <Button onClick={() => setIsEditingProfile(true)}>
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-6">
          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-lg">{userProfile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-lg">{userProfile?.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-lg">{userProfile?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-lg">{userProfile?.address || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">City</Label>
                  <p className="text-lg">{userProfile?.city || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                  <p className="text-lg">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Pro Slot Flow</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {activeSection}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Customer Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default DatabaseCustomerDashboard;