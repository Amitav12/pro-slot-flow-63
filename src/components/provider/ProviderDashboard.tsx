import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProviderSidebar } from './ProviderSidebar';
import { ProviderOverview } from './ProviderOverview';
import { ProviderServices } from './ProviderServices';
import { ProviderBookings } from './ProviderBookings';
import { ProviderProfile } from './ProviderProfile';
import { ProviderEarnings } from './ProviderEarnings';
import { ProviderSchedule } from './ProviderSchedule';
import { ProviderAccessControl } from './ProviderAccessControl';
import { DatabaseStatus } from '../dev/DatabaseStatus';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SecureStorage } from '@/utils/secureStorage';
import { AlertCircle, Clock, LogOut, Loader2, Shield, Menu, X } from 'lucide-react';

export const ProviderDashboard = () => {
  const { user, profile, loading, secureSignOut, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSecureSignOut = async () => {
    console.log('🔐 handleSecureSignOut function called');
    console.log('🔐 Setting isSigningOut to true');
    setIsSigningOut(true);
    try {
      console.log('🔐 Starting sign out process...');
      
      // Step 1: Set logging out flag to immediately stop all session monitoring
      localStorage.setItem('isLoggingOut', 'true');
      console.log('🔐 Logout flag set - stopping all background monitoring');
      
      // Step 2: Close mobile menu if open
      setMobileMenuOpen(false);
      
      // Step 4: Clear secure storage immediately to stop all monitoring
      SecureStorage.clearSession();
      console.log('🔐 Secure storage cleared');
      
      // Step 5: Clear all browser storage (but preserve logout flag temporarily)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key !== 'isLoggingOut') {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      console.log('🔐 Browser storage cleared');
      
      // Step 6: Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('🔐 Cookies cleared');
      
      // Step 7: Try secure sign out first, fallback to regular sign out if it fails
      try {
        await secureSignOut();
        console.log('✅ Secure sign out completed');
      } catch (secureError) {
        console.warn('Secure sign out failed, using regular sign out:', secureError);
        try {
          await signOut();
          console.log('✅ Regular sign out completed');
        } catch (regularError) {
          console.warn('Regular sign out also failed:', regularError);
          // Continue with force logout
        }
      }
      
      // Step 8: Show success message
      toast({
        title: "Signed Out Successfully",
        description: "You have been securely signed out.",
      });
      
      // Step 9: Clear logout flag and redirect
      localStorage.removeItem('isLoggingOut');
      console.log('🔄 Redirecting to auth page...');
      
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
      
      console.log('🔄 Force redirecting to auth page...');
      window.location.href = '/auth';
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has provider access - skip check during sign out
  const hasProviderAccess = profile && (profile.auth_role === 'provider' || profile.role === 'provider');
  
  if (!hasProviderAccess && !isSigningOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access the provider dashboard.</p>
        </div>
      </div>
    );
  }

  // Check if provider profile is pending approval - now handled by ProviderAccessControl
  // This legacy code is kept for backward compatibility but main logic moved to ProviderAccessControl
  const isPendingApproval = profile?.registration_status === 'pending';
  const isApproved = profile?.registration_status === 'approved';

  // Legacy pending approval display - now handled by ProviderAccessControl
  // Keeping this for any edge cases, but main provider approval logic is in ProviderAccessControl
  if (isPendingApproval && false) { // Disabled - ProviderAccessControl handles this now
    return (
      <div className="min-h-screen bg-gray-50">
        <DatabaseStatus />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex">
          {/* Limited Sidebar for Pending Providers - Desktop */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-bold text-gray-800">Provider Portal</span>
              </div>
              <div className="mt-2 text-sm text-yellow-600 font-medium">Pending Approval</div>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Profile Setup</span>
                </div>
                
                {/* Disabled menu items */}
                <div className="space-y-1 mt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                    Available After Approval
                  </div>
                  {['Dashboard', 'Services', 'Bookings', 'Schedule', 'Earnings'].map((item) => (
                    <div key={item} className="flex items-center space-x-3 px-3 py-2 text-gray-400 cursor-not-allowed">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* Sign Out Button for Pending Providers - Desktop */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Desktop Sign Out button clicked - ProviderDashboard');
                  console.log('🔘 Calling handleSecureSignOut directly');
                  handleSecureSignOut();
                }}
                disabled={isSigningOut}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full justify-start disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300 cursor-pointer relative z-10"
                style={{ pointerEvents: 'auto' }}
              >
                {isSigningOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </span>
                <Shield className="h-4 w-4 ml-auto text-green-600" />
              </button>
            </div>
          </div>

          {/* Limited Sidebar for Pending Providers - Mobile */}
          <div
            className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-bold text-gray-800">Provider Portal</span>
              </div>
              <div className="mt-2 text-sm text-yellow-600 font-medium">Pending Approval</div>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Profile Setup</span>
                </div>
                
                {/* Disabled menu items */}
                <div className="space-y-1 mt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                    Available After Approval
                  </div>
                  {['Dashboard', 'Services', 'Bookings', 'Schedule', 'Earnings'].map((item) => (
                    <div key={item} className="flex items-center space-x-3 px-3 py-2 text-gray-400 cursor-not-allowed">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* Sign Out Button for Pending Providers - Mobile */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Mobile Sign Out button clicked - ProviderDashboard');
                  console.log('🔘 Calling handleSecureSignOut directly');
                  setMobileMenuOpen(false);
                  handleSecureSignOut();
                }}
                disabled={isSigningOut}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full justify-start disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300 cursor-pointer relative z-10"
                style={{ pointerEvents: 'auto' }}
              >
                {isSigningOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </span>
                <Shield className="h-4 w-4 ml-auto text-green-600" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 ml-0 md:ml-64">
            <div className="p-4 md:p-8 pt-20 md:pt-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Please complete all required information below. Our team will review your profile and notify you once approved.
                        This typically takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                
                  <ProviderProfile isPendingApproval={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full dashboard for approved providers
  return (
    <ProviderAccessControl>
      <div className="min-h-screen bg-gray-50">
        <DatabaseStatus />
        
        <ProviderSidebar />
        <div className="md:ml-64 min-h-screen">
          <div className="h-screen overflow-y-auto">
            <div className="p-4 md:p-8 pt-16 md:pt-4">
              <Routes>
                <Route path="/" element={<ProviderOverview />} />
                <Route path="/services" element={<ProviderServices />} />
                <Route path="/bookings" element={<ProviderBookings />} />
                <Route path="/schedule" element={<ProviderSchedule />} />
                <Route path="/earnings" element={<ProviderEarnings />} />
                <Route path="/profile" element={<ProviderProfile isPendingApproval={false} />} />
                <Route path="*" element={<Navigate to="/provider" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </ProviderAccessControl>
  );
};