
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  Wrench, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings,
  MapPin,
  LogOut,
  ClipboardCheck,
  Shield,
  User,
  Crown,
  BarChart3,
  CreditCard,
  Bell,
  Gift,
  Star,
  Video
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SecureStorage } from '@/utils/secureStorage';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define navigation sections with icons
const navigationSections = [
  {
    name: 'Dashboard',
    items: [
      { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    ]
  },
  {
    name: 'User Management',
    items: [
      { name: 'User Management', href: '/dashboard/admin?section=users', icon: Users },
      { name: 'Provider Management', href: '/dashboard/admin?section=providers', icon: UserCheck },
      { name: 'Admin Management', href: '/dashboard/admin?section=admins', icon: Crown },
    ]
  },
  {
    name: 'Service Management',
    items: [
      { name: 'Service Management', href: '/dashboard/admin?section=services', icon: Wrench },
      { name: 'Service Status Control', href: '/dashboard/admin?section=service-management', icon: Star },
      { name: 'Category Management', href: '/dashboard/admin?section=categories', icon: FolderTree },
      { name: 'Location Management', href: '/dashboard/admin?section=locations', icon: MapPin },
    ]
  },
  {
    name: 'Operations',
    items: [
      { name: 'Booking Management', href: '/dashboard/admin?section=bookings', icon: Calendar },
      { name: 'Reports & Analytics', href: '/dashboard/admin?section=reports', icon: BarChart3 },
      { name: 'Payment Management', href: '/dashboard/admin?section=payments', icon: CreditCard },
    ]
  },
  {
    name: 'Marketing',
    items: [
      { name: 'Special Offers', href: '/dashboard/admin?section=special-offers', icon: Gift },
      { name: 'Video Gallery', href: '/dashboard/admin?section=video-gallery', icon: Video },
    ]
  },
  {
    name: 'System',
    items: [
      { name: 'Notification Center', href: '/dashboard/admin?section=notifications', icon: Bell },
      { name: 'System Settings', href: '/dashboard/admin?section=settings', icon: Settings },
      { name: 'Admin Permissions', href: '/dashboard/admin?section=permissions', icon: Shield },
    ]
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isRole, secureSignOut, signOut } = useAuth();
  const { permissions, getEnabledSections } = useAdminPermissions();
  const isSuperAdmin = isRole('super_admin');
  
  // Create a mapping from section names to navigation items
  const sectionMapping: Record<string, any> = {
    'users': { name: 'User Management', href: '/dashboard/admin?section=users', icon: Users },
    'providers': { name: 'Provider Management', href: '/dashboard/admin?section=providers', icon: UserCheck },
    'admins': { name: 'Admin Management', href: '/dashboard/admin?section=admins', icon: Crown },
    'services': { name: 'Service Management', href: '/dashboard/admin?section=services', icon: Wrench },
    'categories': { name: 'Category Management', href: '/dashboard/admin?section=categories', icon: FolderTree },
    'locations': { name: 'Location Management', href: '/dashboard/admin?section=locations', icon: MapPin },
    'bookings': { name: 'Booking Management', href: '/dashboard/admin?section=bookings', icon: Calendar },
    'reports': { name: 'Reports & Analytics', href: '/dashboard/admin?section=reports', icon: BarChart3 },
    'payments': { name: 'Payment Management', href: '/dashboard/admin?section=payments', icon: CreditCard },
    'notifications': { name: 'Notification Center', href: '/dashboard/admin?section=notifications', icon: Bell },
    'settings': { name: 'System Settings', href: '/dashboard/admin?section=settings', icon: Settings },
    'special-offers': { name: 'Special Offers', href: '/dashboard/admin?section=special-offers', icon: Gift },
    'service-management': { name: 'Service Status Control', href: '/dashboard/admin?section=service-management', icon: Star },
  };

  // Filter navigation sections based on permissions
  const getFilteredNavigationSections = () => {
    const enabledSections = getEnabledSections();
    
    // For super admin, show all sections
    if (isSuperAdmin) {
      return navigationSections;
    }
    
    // For regular admin, only show enabled sections
    const filteredSections = navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Always show Overview
        if (item.href === '/dashboard/admin') return true;
        
        // Check if the section is enabled for this item
        const sectionKey = item.href.split('?section=')[1];
        return sectionKey && enabledSections.includes(sectionKey);
      })
    })).filter(section => section.items.length > 0); // Remove empty sections
    
    return filteredSections;
  };
  
  // Function to check if a link is active based on the section query parameter
  const isLinkActive = (href: string) => {
    if (href === '/dashboard/admin' && !location.search) {
      return location.pathname === '/dashboard/admin';
    }
    
    if (href.includes('?section=')) {
      const section = href.split('?section=')[1];
      const currentSection = new URLSearchParams(location.search).get('section');
      return currentSection === section && location.pathname === '/dashboard/admin';
    }
    
    return location.pathname === href;
  };

  const handleSecureSignOut = async () => {
    try {
      // Set logging out flag to immediately stop all session monitoring
      localStorage.setItem('isLoggingOut', 'true');
      
      // Clear secure storage immediately to stop all monitoring
      SecureStorage.clearSession();
      
      // Clear all browser storage (but preserve logout flag temporarily)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key !== 'isLoggingOut') {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Try secure sign out first, fallback to regular sign out if it fails
      try {
        await secureSignOut();
      } catch (secureError) {
        console.warn('Secure sign out failed, using regular sign out:', secureError);
        try {
          await signOut();
        } catch (regularError) {
          console.warn('Regular sign out also failed:', regularError);
          // Continue with force logout
        }
      }
      
      // Show success message
      toast({
        title: "Signed Out Successfully",
        description: "You have been securely signed out.",
      });
      
      // Clear logout flag and redirect
      localStorage.removeItem('isLoggingOut');
      
      // Add small delay to ensure all cleanup is complete
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Force clear everything and redirect even if sign out fails
      SecureStorage.clearSession();
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
      
      window.location.href = '/auth';
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return 'A';
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64">
      {/* Main sidebar container with fixed height and flex structure */}
      <div className="flex flex-col h-full">
        {/* Header with logo and title - fixed at top */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {isSuperAdmin ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <h1 className="text-lg font-bold text-white">
              {isSuperAdmin ? 'Super Admin' : 'Admin'} Panel
            </h1>
          </div>
        </div>
        
        {/* User profile section - fixed below header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-800">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isSuperAdmin ? (
                  <span className="flex items-center">
                    <Crown className="w-3 h-3 mr-1 text-yellow-500" />
                    Super Administrator
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-blue-500" />
                    Administrator
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation - scrollable section */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {getFilteredNavigationSections().map((section, index) => (
          <div key={section.name} className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.name}
            </h3>
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isLinkActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={(e) => {
                // Close mobile menu if it exists in parent component
                const event = new CustomEvent('closeMobileMenu');
                document.dispatchEvent(event);
              }}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
             </div>
           </div>
         ))}
      </nav>
      
      {/* Footer with sign out button - Always visible at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 mt-auto">
        <Button
          onClick={handleSecureSignOut}
          variant="outline"
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
      </div>
    </div>
  );
};
