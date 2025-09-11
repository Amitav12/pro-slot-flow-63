
import React from 'react';
// This import should remain as-is (correct path)
import { Header } from './Header';
import { Footer } from './Footer';
import QuickSupportButton from '../QuickSupportButton';


interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  onCartClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  onCartClick
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header onCartClick={onCartClick} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <QuickSupportButton />
    </div>
  );
};
