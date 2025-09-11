import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Code, AlertTriangle } from 'lucide-react';
import { shouldBypassAdminAuth } from '@/config/development';

export const DevAdminAccess: React.FC = () => {
  const navigate = useNavigate();

  // Only show this component in development mode
  if (!shouldBypassAdminAuth()) {
    navigate('/');
    return null;
  }

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  const handleSuperAdminAccess = () => {
    navigate('/admin');
  };

  const handleProviderAccess = () => {
    navigate('/provider');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="card-elevated w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Development Mode</h1>
            <p className="text-gray-600">Direct admin access for development</p>
          </div>

          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <p className="text-orange-700 text-sm">
              Authentication is bypassed in development mode
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleAdminAccess}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access as Admin
            </Button>

            <Button
              onClick={handleSuperAdminAccess}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access as Super Admin
            </Button>

            <Button
              onClick={handleProviderAccess}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access as Service Provider
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              This page only appears in development mode.<br />
              Authentication will be enforced in production.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};