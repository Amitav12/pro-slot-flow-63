import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Shield,
  AlertCircle
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, is_blocked')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          // If no profile exists, create one with admin role for development
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: data.user.id,
                role: 'admin',
                full_name: data.user.email?.split('@')[0] || 'Admin',
                is_blocked: false
              }
            ] as any);

          if (!insertError) {
            navigate('/admin');
            return;
          }
        }

        if ((profile as any)?.is_blocked) {
          setError('Your account has been blocked. Please contact support.');
          await supabase.auth.signOut();
          return;
        }

        if ((profile as any)?.role === 'admin' || (profile as any)?.role === 'super_admin') {
          navigate('/admin');
        } else {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Demo admin credentials
      const demoEmail = 'admin@serviceplatform.com';
      const demoPassword = 'Admin@2024';

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInError) {
        // If demo user doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          // Create admin profile
          await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: signUpData.user.id,
                role: 'admin',
                full_name: 'Demo Admin',
                is_blocked: false
              }
            ] as any);

          navigate('/admin');
        }
      } else if (data.user) {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="card-elevated w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-primary w-full pl-10 pr-4 py-3"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input-primary w-full pl-10 pr-12 py-3"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn-secondary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                'Use Demo Admin Account'
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Demo: admin@serviceplatform.com / Admin@2024
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              ← Back to User Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};