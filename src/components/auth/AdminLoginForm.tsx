
import React, { useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Secure admin credentials - only admin and super admin can access
      if (credentials.username === 'superadmin' && credentials.password === 'Admin@2024!') {
        // First, try to sign in with the secure admin email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'superadmin@serviceplatform.com',
          password: 'SuperAdmin@2024!',
        });

        if (error) {
          // If admin doesn't exist or email not confirmed, create and confirm it
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            console.log('Creating or confirming admin user...');
            
            // Try to sign up the super admin user
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: 'superadmin@serviceplatform.com',
              password: 'SuperAdmin@2024!',
              options: {
                data: {
                  full_name: 'Super Administrator',
                  phone: '+1-555-0001',
                  role: 'super_admin'
                },
                emailRedirectTo: window.location.origin
              }
            });

            if (signUpError && !signUpError.message.includes('User already registered')) {
              toast({
                title: "Admin Setup Failed",
                description: signUpError.message,
                variant: "destructive",
              });
              return;
            }

            // If user already exists but email not confirmed, we need to confirm it manually
            // For demo purposes, we'll show a message about email confirmation
            if (error.message.includes('Email not confirmed')) {
              toast({
                title: "Email Confirmation Required",
                description: "For demo purposes, please check your email and confirm the admin account, or disable email confirmation in Supabase Auth settings.",
                variant: "destructive",
              });
              return;
            }

            // Try to sign in again after signup
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: 'superadmin@serviceplatform.com',
              password: 'SuperAdmin@2024!',
            });

            if (signInError) {
              if (signInError.message.includes('Email not confirmed')) {
                toast({
                  title: "Email Confirmation Required",
                  description: "Please check your email and confirm the admin account, or disable email confirmation in Supabase Auth settings.",
                  variant: "destructive",
                });
                return;
              }
              
              toast({
                title: "Admin Login Failed",
                description: signInError.message,
                variant: "destructive",
              });
              return;
            }
          } else {
            toast({
              title: "Admin Login Failed",
              description: error.message,
              variant: "destructive",
            });
            return;
          }
        }

        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin dashboard.",
        });
        
        onSuccess();
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please check your admin username and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-soft">
        <div className="flex items-center space-x-3 text-blue-800 mb-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Admin Access Credentials</span>
        </div>
        <div className="space-y-3 text-blue-700">
          <div className="bg-white/60 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Admin Username:</p>
            <p className="text-lg font-bold">superadmin</p>
          </div>
          <div className="bg-white/60 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Admin Password:</p>
            <p className="text-lg font-bold">Admin@2024!</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-purple-100/50 rounded-lg">
          <p className="text-xs text-purple-600 font-medium">🔒 Only Admin and Super Admin roles can access the dashboard</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
        <div className="text-amber-800 text-sm">
          <p><strong>Note:</strong> If you get an "Email not confirmed" error, you can disable email confirmation in your Supabase Auth settings for easier testing.</p>
          <p className="mt-1">Go to: Authentication → Settings → Email Auth → Disable "Confirm email"</p>
        </div>
      </div>

      <form onSubmit={handleAdminLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Admin Username</label>
          <Input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            className="w-full"
            placeholder="Enter admin username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
          <Input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full"
            placeholder="Enter admin password"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          {loading ? 'Signing in...' : 'Admin Sign In'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBackToLogin}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Login
        </Button>
      </form>
    </div>
  );
};
