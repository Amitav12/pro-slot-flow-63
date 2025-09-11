import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Upload, User, UserCheck, Loader2, Shield, CheckCircle, XCircle, AlertCircle, FileText, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'provider';
  businessName?: string;
  idProofFile?: File;
  idProofUrl?: string;
  agreeToTerms: boolean;
}
interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  match: boolean;
}
interface LoginData {
  email: string;
  password: string;
}
export const EnhancedAuthPage: React.FC<{
  onAuthSuccess: () => void;
}> = ({
  onAuthSuccess
}) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Remove this duplicate line: const { toast } = useToast();

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'customer',
    businessName: '',
    idProofFile: undefined,
    idProofUrl: '',
    agreeToTerms: false
  });

  // Real-time password validation - FIXED LENGTH VALIDATION
  const validatePasswordRealTime = (password: string, confirmPassword: string = signupData.confirmPassword) => {
    const validation: PasswordValidation = {
      length: password.length >= 6 && password.length <= 20,
      // Updated to 6-20 characters
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: confirmPassword.length > 0 ? password === confirmPassword : true
    };
    setPasswordValidation(validation);
    return validation;
  };

  // Handle password change
  const handlePasswordChange = (password: string) => {
    setSignupData(prev => ({
      ...prev,
      password
    }));
    validatePasswordRealTime(password);
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setSignupData(prev => ({
      ...prev,
      confirmPassword
    }));
    validatePasswordRealTime(signupData.password, confirmPassword);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPEG, PNG, GIF, PDF, or Word document",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Store file for upload during signup
    setSignupData(prev => ({
      ...prev,
      idProofFile: file
    }));
    toast({
      title: "File Selected",
      description: `${file.name} selected successfully`
    });
  };

  // Handle ID proof upload for providers
  const handleIdProofUpload = async (file: File) => {
    try {
      setUploadingId(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `id-proof-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const {
        data,
        error
      } = await supabase.storage.from('documents').upload(`id-proofs/${fileName}`, file);
      if (error) throw error;

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('documents').getPublicUrl(data.path);
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading ID proof:', error);
      throw error;
    } finally {
      setUploadingId(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      if (error) throw error;
      toast({
        title: "Welcome Back!",
        description: "You have been logged in successfully"
      });
      console.log('🎯 Login successful, calling onAuthSuccess');

      // Call the callback to let parent handle navigation
      onAuthSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signupData.email || !signupData.password || !signupData.fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check password validation - COMPLETELY FIXED LOGIC
    const password = signupData.password;
    const confirmPassword = signupData.confirmPassword;

    // Individual validation checks - FIXED LENGTH REQUIREMENT
    const lengthValid = password.length >= 6 && password.length <= 20; // More reasonable length
    const uppercaseValid = /[A-Z]/.test(password);
    const lowercaseValid = /[a-z]/.test(password);
    const numberValid = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword;

    // Check if all requirements are met
    if (!lengthValid) {
      toast({
        title: "Invalid Password",
        description: "Password must be 6-20 characters long",
        variant: "destructive"
      });
      return;
    }
    if (!uppercaseValid) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one uppercase letter",
        variant: "destructive"
      });
      return;
    }
    if (!lowercaseValid) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one lowercase letter",
        variant: "destructive"
      });
      return;
    }
    if (!numberValid) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one number",
        variant: "destructive"
      });
      return;
    }
    if (!passwordsMatch) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    if (signupData.role === 'provider' && !signupData.idProofFile) {
      toast({
        title: "ID Proof Required",
        description: "Service providers must upload a valid ID proof",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);

      // Check for duplicate credentials with improved error handling
      try {
        // First check if email already exists in auth.users
        const {
          data: authUsers,
          error: authError
        } = await supabase.auth.admin.listUsers();
        if (!authError && authUsers?.users) {
          const emailExists = authUsers.users.some((user: {
            email?: string;
          }) => user.email === signupData.email);
          if (emailExists) {
            toast({
              title: "Email Already Registered",
              description: "This email is already registered. Please use a different email or sign in to your existing account.",
              variant: "destructive"
            });
            return;
          }
        }

        // Check for duplicate credentials using RPC function
        const {
          data: duplicateCheck,
          error: checkError
        } = await supabase.rpc('check_duplicate_credentials', {
          check_email: signupData.email,
          check_phone: signupData.phone || null,
          check_full_name: signupData.fullName
        });
        if (!checkError && duplicateCheck && Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
          const result = duplicateCheck[0];
          if (result.exists_email) {
            toast({
              title: "Email Already Registered",
              description: "This email is already registered. Please use a different email or sign in to your existing account.",
              variant: "destructive"
            });
            return;
          }
          if (result.exists_phone && signupData.phone) {
            toast({
              title: "Phone Number Already Used",
              description: `This phone number is already registered${result.existing_role ? ` as a ${result.existing_role}` : ''}. Please use a different phone number.`,
              variant: "destructive"
            });
            return;
          }
          if (result.exists_name) {
            toast({
              title: "Name Already Used",
              description: `This name is already registered${result.existing_role ? ` as a ${result.existing_role}` : ''}. Please use a different name or contact support if this is your name.`,
              variant: "destructive"
            });
            return;
          }
        }
      } catch (duplicateError) {
        console.warn('Duplicate check failed, continuing with signup:', duplicateError);
        // Continue with signup even if duplicate check fails
      }
      let idProofUrl = '';

      // Upload ID proof if provider
      if (signupData.role === 'provider' && signupData.idProofFile) {
        idProofUrl = await handleIdProofUpload(signupData.idProofFile);
      }

      // Sign up user with enhanced profile creation
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            role: signupData.role,
            business_name: signupData.businessName || null,
            id_document_url: idProofUrl || null
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        // Wait for database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Ensure profile exists with better error handling
        let profileCreated = false;
        let retryCount = 0;
        const maxRetries = 3;
        while (!profileCreated && retryCount < maxRetries) {
          try {
            // Check if profile exists
            const {
              data: existingProfile,
              error: selectError
            } = await supabase.from('user_profiles').select('*').eq('user_id', data.user.id).maybeSingle();
            if (selectError && selectError.code !== 'PGRST116') {
              throw selectError;
            }
            const profileData = {
              user_id: data.user.id,
              full_name: signupData.fullName,
              phone: signupData.phone,
              role: signupData.role,
              auth_role: signupData.role,
              business_name: signupData.businessName || null,
              id_document_url: idProofUrl || null,
              registration_status: signupData.role === 'provider' ? 'pending' : 'approved',
              onboarding_completed: signupData.role === 'customer',
              updated_at: new Date().toISOString()
            };
            if (existingProfile) {
              // Profile exists, update it
              const {
                error: updateError
              } = await supabase.from('user_profiles').update(profileData).eq('user_id', data.user.id);
              if (!updateError) {
                profileCreated = true;
              } else {
                console.warn(`Profile update attempt ${retryCount + 1} failed:`, updateError);
              }
            } else {
              // Profile doesn't exist, create it
              const {
                error: insertError
              } = await supabase.from('user_profiles').insert(profileData);
              if (!insertError) {
                profileCreated = true;
              } else {
                console.warn(`Profile creation attempt ${retryCount + 1} failed:`, insertError);
              }
            }
          } catch (profileError) {
            console.warn(`Profile operation attempt ${retryCount + 1} failed:`, profileError);
          }
          retryCount++;
          if (!profileCreated && retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        if (!profileCreated) {
          console.warn('Profile creation/update failed after all retries, but user account was created successfully');
        }
      }
      toast({
        title: "Account Created!",
        description: signupData.role === 'provider' ? "Your provider account is pending approval. You'll be notified once approved." : "Welcome! Your account has been created successfully."
      });

      // Handle different signup scenarios
      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Check Your Email",
          description: "Please check your email to verify your account before signing in"
        });
        setActiveTab('login');
      } else if (data.user && data.session) {
        // User is immediately signed in
        toast({
          title: "Redirecting...",
          description: "Taking you to your dashboard"
        });
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          onAuthSuccess();
        }, 500);
      } else {
        // Fallback
        setActiveTab('login');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-orange-50 to-purple-100 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-1000">
      <Card className="w-full max-w-md sm:max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse hover:scale-110 transition-transform duration-300">
            <Shield className="h-8 w-8 text-white animate-bounce" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Your home services, simplified
            </CardTitle>
            <CardDescription className="text-gray-600 text-base sm:text-lg mt-2">
              Book trusted professionals for cleaning, repairs, beauty and more
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg font-medium text-gray-950 bg-green-400 hover:bg-green-300">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-medium bg-red-500 hover:bg-red-400 text-gray-800">Create Account</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-6 mt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input id="login-email" type="email" placeholder="Email address" value={loginData.email} onChange={e => setLoginData(prev => ({
                  ...prev,
                  email: e.target.value
                }))} className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Password" value={loginData.password} onChange={e => setLoginData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))} className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12" required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 hover:scale-105 font-medium text-base shadow-lg transition-all duration-300 transform" disabled={loading}>
                  {loading ? <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </> : 'Sign In'}
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    New to our platform?{' '}
                    <button type="button" onClick={() => setActiveTab('signup')} className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                      Get Started
                    </button>
                  </p>
                </div>
              </form>

              {/* Removed admin access notice as requested */}
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-6 mt-6">
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Choose Account Type</Label>
                  <Select value={signupData.role} onValueChange={(value: 'customer' | 'provider') => setSignupData(prev => ({
                  ...prev,
                  role: value
                }))}>
                    <SelectTrigger className="h-14 rounded-xl border-gray-200 focus:border-purple-500">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="customer" className="h-12 rounded-lg">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Customer</div>
                            <div className="text-xs text-gray-500">Book and manage services</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="provider" className="h-12 rounded-lg">
                        <div className="flex items-center space-x-3 py-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Service Provider</div>
                            <div className="text-xs text-gray-500">Offer professional services</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input id="fullName" placeholder="Full name" value={signupData.fullName} onChange={e => setSignupData(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))} className="h-12 rounded-xl border-gray-200 focus:border-purple-500" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Phone number" value={signupData.phone} onChange={e => setSignupData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} className="h-12 rounded-xl border-gray-200 focus:border-purple-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <Input id="email" type="email" placeholder="Email address" value={signupData.email} onChange={e => setSignupData(prev => ({
                  ...prev,
                  email: e.target.value
                }))} className="h-12 rounded-xl border-gray-200 focus:border-blue-500" required />
                </div>

                {/* Provider-specific fields */}
                {signupData.role === 'provider' && <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                        Business Name <span className="text-gray-400">(Optional)</span>
                      </Label>
                      <Input id="businessName" placeholder="Business name" value={signupData.businessName} onChange={e => setSignupData(prev => ({
                    ...prev,
                    businessName: e.target.value
                  }))} className="h-12 rounded-xl border-gray-200 focus:border-blue-500" />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Valid ID Proof * (Images, PDF, Word - Max 5MB)</Label>
                      <div className="relative">
                        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 hover:scale-105 transition-all duration-300 transform">
                          {signupData.idProofFile ? <div className="space-y-2 animate-in zoom-in-50 duration-500">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mx-auto animate-bounce">
                                {signupData.idProofFile.type.startsWith('image/') ? <Image className="h-6 w-6 text-green-600" /> : <FileText className="h-6 w-6 text-green-600" />}
                              </div>
                              <div className="text-sm font-semibold text-green-700">{signupData.idProofFile.name}</div>
                              <div className="text-xs text-green-600 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                File selected successfully
                              </div>
                            </div> : <div className="space-y-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto hover:bg-purple-100 transition-colors duration-200">
                                <Upload className="h-6 w-6 text-gray-400 hover:text-purple-500 transition-colors duration-200" />
                              </div>
                              <div className="text-sm font-medium text-gray-700">Click to upload ID proof</div>
                              <div className="text-xs text-gray-500">JPEG, PNG, GIF, PDF, Word documents</div>
                            </div>}
                        </div>
                      </div>
                    </div>
                  </>}

                {/* Password Fields with Real-time Validation */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Create Password * (6-20 characters)</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Password" value={signupData.password} onChange={e => handlePasswordChange(e.target.value)} className="h-12 rounded-xl border-gray-200 focus:border-purple-500 pr-12" required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                  
                  {/* Password Requirements with Smooth Animations */}
                  {signupData.password && <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Password Strength:
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className={`flex items-center space-x-2 transition-all duration-300 ${passwordValidation.length ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
                          <div className={`transition-all duration-300 ${passwordValidation.length ? 'animate-bounce' : ''}`}>
                            {passwordValidation.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </div>
                          <span className="font-medium">6-20 characters</span>
                        </div>
                        <div className={`flex items-center space-x-2 transition-all duration-300 ${passwordValidation.uppercase ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
                          <div className={`transition-all duration-300 ${passwordValidation.uppercase ? 'animate-bounce' : ''}`}>
                            {passwordValidation.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </div>
                          <span className="font-medium">Uppercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-2 transition-all duration-300 ${passwordValidation.lowercase ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
                          <div className={`transition-all duration-300 ${passwordValidation.lowercase ? 'animate-bounce' : ''}`}>
                            {passwordValidation.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </div>
                          <span className="font-medium">Lowercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-2 transition-all duration-300 ${passwordValidation.number ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
                          <div className={`transition-all duration-300 ${passwordValidation.number ? 'animate-bounce' : ''}`}>
                            {passwordValidation.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </div>
                          <span className="font-medium">Number</span>
                        </div>
                      </div>
                      
                      {/* Password Strength Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Strength:</span>
                          <span className={`font-medium ${
                      // Count only the 4 main requirements (exclude match)
                      [passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 4 ? 'text-green-600' : [passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {[passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 4 ? 'Strong' : [passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 2 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-500 ${
                      // Count only the 4 main requirements (exclude match)
                      [passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 4 ? 'bg-green-500 w-full' : [passwordValidation.length, passwordValidation.uppercase, passwordValidation.lowercase, passwordValidation.number].filter(Boolean).length >= 2 ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'}`} />
                        </div>
                      </div>
                    </div>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={signupData.confirmPassword} onChange={e => handleConfirmPasswordChange(e.target.value)} className={`h-12 rounded-xl border-gray-200 focus:border-purple-500 pr-12 ${signupData.confirmPassword && !passwordValidation.match ? 'border-red-300 focus:border-red-500' : ''}`} required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                  
                  {/* Password Match Indicator with Animation */}
                  {signupData.confirmPassword && <div className={`flex items-center space-x-2 text-xs transition-all duration-300 animate-in slide-in-from-left-2 ${signupData.password === signupData.confirmPassword ? 'text-green-600 scale-105' : 'text-red-500'}`}>
                      <div className={`transition-all duration-300 ${signupData.password === signupData.confirmPassword ? 'animate-bounce' : 'animate-pulse'}`}>
                        {signupData.password === signupData.confirmPassword ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      </div>
                      <span className="font-medium">
                        {signupData.password === signupData.confirmPassword ? '✨ Passwords match perfectly!' : '⚠️ Passwords do not match'}
                      </span>
                    </div>}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <Checkbox id="terms" checked={signupData.agreeToTerms} onCheckedChange={checked => setSignupData(prev => ({
                  ...prev,
                  agreeToTerms: checked as boolean
                }))} className="mt-0.5" />
                  <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    By signing up, you agree to our <span className="text-purple-600 font-medium">Terms & Privacy Policy</span>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 hover:scale-105 font-medium text-base shadow-lg transition-all duration-300 transform" disabled={loading || uploadingId}>
                  {loading || uploadingId ? <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {uploadingId ? 'Uploading...' : 'Creating Account...'}
                    </> : 'Create Account'}
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('login')} className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                      Sign In
                    </button>
                  </p>
                </div>
              </form>

              {/* Provider Notice - Updated messaging */}
              {signupData.role === 'provider' && <div className="bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-200 rounded-xl p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800 mb-2">🎯 Service Provider Journey</div>
                      <div className="space-y-1 text-gray-700">
                        <p>• Your account will be created with <span className="font-medium text-purple-600">Pending</span> status</p>
                        <p>• Admin approval required to access provider features</p>
                        <p>• Register services with valid licenses after approval</p>
                        <p>• Full dashboard access once confirmed by administrators</p>
                      </div>
                    </div>
                  </div>
                </div>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};