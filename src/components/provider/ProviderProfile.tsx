import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText,
  Camera,
  Save,
  Edit,
  Star,
  Award,
  AlertCircle,
  Upload,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

interface ProviderProfileProps {
  isPendingApproval?: boolean;
}

export const ProviderProfile: React.FC<ProviderProfileProps> = ({ isPendingApproval = false }) => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    street_address: profile?.street_address || '',
    city: profile?.city || '', 
    state: profile?.state || '',
    postal_code: profile?.postal_code || '',
    country: profile?.country || 'United States',
    bio: '',
    license_number: profile?.license_number || '',
    years_experience: 0,
    specializations: ['Plumbing', 'Electrical', 'HVAC'],
    certifications: ['Licensed Plumber', 'Electrical Contractor', 'HVAC Certified']
  });

  const registrationStatus = profile?.registration_status || 'pending';

  const stats = {
    totalJobs: 156,
    rating: 4.8,
    responseTime: '2 hours',
    completionRate: 98,
    repeatCustomers: 45
  };

  const reviews = [
    {
      id: '1',
      customer: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent work! Very professional and completed the job quickly.',
      date: '2025-09-01',
      service: 'Plumbing Repair'
    },
    {
      id: '2',
      customer: 'Mike Wilson',
      rating: 5,
      comment: 'Great service, fair pricing, and very reliable. Highly recommend!',
      date: '2025-08-28',
      service: 'HVAC Maintenance'
    },
    {
      id: '3',
      customer: 'Emily Davis',
      rating: 4,
      comment: 'Good work overall. Arrived on time and fixed the issue.',
      date: '2025-08-25',
      service: 'Electrical Installation'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save profile data
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isPendingApproval ? 'Complete Your Profile' : 'Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPendingApproval 
              ? 'Please provide all required information for admin review'
              : 'Manage your professional profile and settings'
            }
          </p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              {isPendingApproval ? 'Update Profile' : 'Edit Profile'}
            </>
          )}
        </Button>
      </div>

      {/* Status Alert for Pending Approval */}
      {isPendingApproval && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Profile Under Review</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your profile is being reviewed by our admin team. Please ensure all information is accurate and complete.
                You'll receive an email notification once your profile is approved.
              </p>
              <div className="mt-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Required Information:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Full Name</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Phone Number</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>ID Proof Document (Upload required)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Business Information</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isPendingApproval ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          {!isPendingApproval && (
            <>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.full_name || 'Provider Name'}</h2>
                    <Badge className={
                      registrationStatus === 'approved' 
                        ? "bg-green-100 text-green-800" 
                        : registrationStatus === 'pending'
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }>
                      {registrationStatus === 'approved' && 'Verified Provider'}
                      {registrationStatus === 'pending' && 'Pending Review'}
                      {registrationStatus === 'rejected' && 'Review Required'}
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-600 mb-1">{profileData.business_name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{stats.rating} rating</span>
                    </div>
                    <span>•</span>
                    <span>{stats.totalJobs} jobs completed</span>
                    <span>•</span>
                    <span>{profileData.years_experience} years experience</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{profileData.full_name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{profileData.business_name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                    <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{profileData.email}</span>
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.street_address}
                      onChange={(e) => handleInputChange('street_address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your street address"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{profileData.street_address || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city"
                    />
                  ) : (
                    <span>{profileData.city || 'Not provided'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter state"
                    />
                  ) : (
                    <span>{profileData.state || 'Not provided'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip/Postal Code
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter zip/postal code"
                    />
                  ) : (
                    <span>{profileData.postal_code || 'Not provided'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{profileData.country}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{profileData.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ID Proof Upload for Pending Providers */}
          {isPendingApproval && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>ID Proof Document</span>
                  <Badge variant="outline" className="text-red-600 border-red-200">Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload ID Proof</h3>
                  <p className="text-gray-600 mb-4">
                    Please upload a clear photo of your government-issued ID (Driver's License, Passport, etc.)
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
                
                {profile?.id_document_url && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">ID Document Uploaded</p>
                        <p className="text-sm text-green-700">Your ID proof has been submitted for review.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{profileData.license_number}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.years_experience}
                      onChange={(e) => handleInputChange('years_experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>{profileData.years_experience} years</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.certifications.map((cert, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!isPendingApproval && (
          <TabsContent value="performance" className="space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.rating}</h3>
                <p className="text-gray-600">Average Rating</p>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.floor(stats.rating))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.completionRate}%</h3>
                <p className="text-gray-600">Completion Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.repeatCustomers}%</h3>
                <p className="text-gray-600">Repeat Customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Jobs Completed</span>
                    <span className="font-semibold">{stats.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Response Time</span>
                    <span className="font-semibold">{stats.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On-Time Completion</span>
                    <span className="font-semibold">96%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rebooking Rate</span>
                    <span className="font-semibold">{stats.repeatCustomers}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {!isPendingApproval && (
          <TabsContent value="reviews" className="space-y-6">
          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.customer}</h4>
                        <p className="text-sm text-gray-600">{review.service}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};