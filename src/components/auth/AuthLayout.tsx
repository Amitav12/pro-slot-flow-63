
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">UC</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
            <p className="text-purple-100 text-sm">{subtitle}</p>
          </div>
          
          <div className="px-8 py-8">
            {children}
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure • Reliable • Professional
          </p>
        </div>
      </div>
    </div>
  );
};
