
import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignupFormProps {
  onSuccess: () => void;
  onToggleMode: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if phone number already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('phone')
        .eq('phone', formData.phone)
        .single();

      if (existingProfile) {
        toast({
          title: "Phone Number Already Registered",
          description: "This phone number is already associated with another account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      
      onSuccess();
    } catch (error) {
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
    <form onSubmit={handleSignup} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Email address"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">I want to</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({...formData, role: 'customer'})}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.role === 'customer'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">Book Services</div>
              <div className="text-sm opacity-75">As a Customer</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, role: 'provider'})}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.role === 'provider'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">Provide Services</div>
              <div className="text-sm opacity-75">As a Provider</div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Password"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};
