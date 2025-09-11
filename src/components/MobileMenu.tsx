
import React from 'react';
import { X, Home, ShoppingBag, Heart, User, Settings, HelpCircle } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigation: (page: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNavigation
}) => {
  if (!isOpen) return null;

  const handleNavigation = (page: string) => {
    onNavigation(page);
    onClose();
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-background/95 backdrop-blur-lg" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-surface border-r border-border shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">SNL</span>
              </div>
              <div>
                <div className="font-bold text-text-primary">Service NB Link</div>
                <div className="text-xsmall text-text-muted">Professional Services</div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-background rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-text-muted" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="w-full flex items-center space-x-3 p-4 text-left rounded-xl hover:bg-background transition-colors group"
              >
                <item.icon className="h-5 w-5 text-text-muted group-hover:text-primary" />
                <span className="text-text-primary group-hover:text-primary">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="text-xsmall text-text-muted text-center">
              Service NB Link v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
