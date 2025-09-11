
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Home,
  Package,
  Heart,
  Settings,
  LogOut,
  Shield,
  MapPin,
  ChevronDown,
  Search,
  Bell
} from 'lucide-react';

export const Header = ({ onCartClick }: { onCartClick?: () => void }) => {
  const { user, isAuthenticated, signOut, isAdmin, isCustomer, isProvider } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin');
      else if (isProvider) navigate('/provider');
      else if (isCustomer) navigate('/customer');
      else navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Package },
    { href: '/bookings', label: 'Bookings', icon: Heart },
    { href: '/help', label: 'Help', icon: User },
  ];

  const [selectedLocation, setSelectedLocation] = useState('New Brunswick, NB');

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">UC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Service NB Link</h1>
                <p className="text-xs text-gray-500">Home services, on demand</p>
              </div>
            </Link>

            {/* Location Selector - Desktop */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">{selectedLocation}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>



            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative hover:bg-gray-100 p-2"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    2
                  </Badge>
                </Button>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-gray-100 p-2"
                onClick={onCartClick || (() => navigate('/cart'))}
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-purple-600 text-white">
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={handleAuthAction}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                    >
                      {isAdmin && <Shield className="h-4 w-4 text-purple-600" />}
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {isAdmin ? 'Admin' : isProvider ? 'Provider' : 'Account'}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleAuthAction} className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium">
                    Sign In
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>


        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">UC</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Location Selector - Mobile */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{selectedLocation}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Search Bar - Mobile */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Auth Section */}
              <div className="border-t pt-6">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleAuthAction();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      {isAdmin && <Shield className="h-4 w-4 mr-2" />}
                      <User className="h-4 w-4 mr-2" />
                      {isAdmin ? 'Admin Dashboard' : isProvider ? 'Provider Dashboard' : 'My Account'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                      onClick={() => {
                        handleAuthAction();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium"
                    >
                      Sign In
                    </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
