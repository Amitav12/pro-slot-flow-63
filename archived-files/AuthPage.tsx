
import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AdminLoginForm } from './AdminLoginForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  if (isAdminLogin) {
    return (
      <AuthLayout
        title="Admin Access"
        subtitle="Sign in to admin dashboard"
      >
        <AdminLoginForm
          onSuccess={onAuthSuccess}
          onBackToLogin={() => setIsAdminLogin(false)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={isLogin ? 'Your home services, simplified' : 'Your home services, simplified'}
      subtitle={isLogin ? 'Book trusted professionals for cleaning, repairs, beauty and more' : 'Book trusted professionals for cleaning, repairs, beauty and more'}
    >
      {isLogin ? (
        <LoginForm
          onSuccess={onAuthSuccess}
          onToggleMode={() => setIsLogin(false)}
          onAdminLogin={() => setIsAdminLogin(true)}
        />
      ) : (
        <SignupForm
          onSuccess={onAuthSuccess}
          onToggleMode={() => setIsLogin(true)}
        />
      )}
    </AuthLayout>
  );
};
