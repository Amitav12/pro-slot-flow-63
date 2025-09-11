import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin
} from 'lucide-react';

export const Footer = () => {
  const serviceCategories = [
    { name: 'Men\'s Services', href: '/categories/men' },
    { name: 'Women\'s Services', href: '/categories/women' },
    { name: 'Home Services', href: '/categories/home' },
    { name: 'Auto Services', href: '/categories/auto' },
    { name: 'Health & Wellness', href: '/categories/health' },
    { name: 'Tech Support', href: '/categories/tech' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Partner With Us', href: '/partner' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Safety Guidelines', href: '/safety' },
  ];

  return (
    <footer className="bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 text-white py-12 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-orange-700 font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">Service NB Link</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Your trusted platform for professional home services. Quality service at your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              {serviceCategories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              {supportLinks.slice(0, 4).map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white hover:text-gray-200 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-white">
              © 2024 ServiceHub. All rights reserved.
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">Follow us:</span>
              <div className="flex space-x-3">
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Facebook className="h-5 w-5" />
                </button>
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Instagram className="h-5 w-5" />
                </button>
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Additional Links */}
            <div className="flex space-x-4 text-sm">
              {supportLinks.slice(4).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;