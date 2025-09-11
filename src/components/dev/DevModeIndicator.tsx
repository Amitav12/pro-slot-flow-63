import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { shouldBypassAdminAuth } from '@/config/development';

export const DevModeIndicator: React.FC = () => {
  if (!shouldBypassAdminAuth()) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="h-4 w-4" />
        <span>DEVELOPMENT MODE - Authentication Bypassed</span>
        <AlertTriangle className="h-4 w-4" />
      </div>
    </div>
  );
};