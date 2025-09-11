
import React from 'react';
import { X, Star, Shield, Phone, Mail, MapPin, Clock, Calendar, Heart } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  verified: boolean;
  services: string[];
  distance: string;
  completedJobs: number;
  responseTime: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  availability: string;
}

interface ProviderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onBookNow: () => void;
  onToggleFavorite: (providerId: number) => void;
  isFavorite: boolean;
}

export const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  isOpen,
  onClose,
  provider,
  onBookNow,
  onToggleFavorite,
  isFavorite
}) => {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-strong rounded-3xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {provider.name.charAt(0)}
                </div>
                {provider.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-h3 text-text-primary mb-2">{provider.name}</h3>
                <div className="flex items-center space-x-4 text-small text-text-muted mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-bold text-text-primary">{provider.rating}</span>
                    <span>({provider.reviews} reviews)</span>
                  </div>
                  <span>{provider.distance} away</span>
                </div>
                {provider.verified && (
                  <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-xsmall font-semibold">
                    Verified Provider
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleFavorite(provider.id)}
                className={`p-3 rounded-2xl transition-all ${
                  isFavorite 
                    ? 'text-error bg-error/10 scale-110 shadow-lg' 
                    : 'text-text-muted hover:text-error hover:bg-error/10'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface/50 rounded-xl transition-all duration-200"
              >
                <X className="h-6 w-6 text-text-muted" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-body text-text-secondary">{provider.description}</p>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h4 className="text-h4 text-text-primary mb-3">Services Offered</h4>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service) => (
                <span key={service} className="bg-info/10 text-info border border-info/20 px-3 py-2 rounded-xl text-small font-medium">
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="text-h4 text-primary font-bold">{provider.completedJobs}</div>
              <div className="text-xsmall text-text-muted">Jobs Completed</div>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="text-h4 text-primary font-bold">{provider.responseTime}</div>
              <div className="text-xsmall text-text-muted">Response Time</div>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-h4 text-primary font-bold">{provider.rating}★</div>
              <div className="text-xsmall text-text-muted">Average Rating</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-h4 text-text-primary mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-body text-text-primary">{provider.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-body text-text-primary">{provider.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-body text-text-primary">{provider.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-body text-text-primary">{provider.availability}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking */}
          <div className="bg-surface rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-h3 text-text-primary font-bold">${provider.price}</span>
                  {provider.originalPrice && (
                    <span className="text-body text-text-muted line-through">${provider.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-small">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-success font-medium">Available for booking</span>
                </div>
              </div>
              <button 
                onClick={onBookNow}
                className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-8 py-3 rounded-2xl flex items-center space-x-2 font-bold hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Calendar className="h-5 w-5" />
                <span>Book Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
