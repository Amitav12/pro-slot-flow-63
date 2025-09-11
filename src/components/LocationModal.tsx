
import React, { useEffect } from 'react';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useLocations, Location } from '@/hooks/useLocations';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationSelect: (location: string) => void;
  loading: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationSelect,
  loading
}) => {
  const { locations, loading: locationsLoading } = useLocations();

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate location detection
          onLocationSelect("Detected: Moncton, NB");
        },
        (error) => {
          console.error('Error detecting location:', error);
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-strong rounded-3xl shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 text-text-primary">Select Location</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface/50 rounded-xl transition-all duration-200"
            >
              <X className="h-6 w-6 text-text-muted" />
            </button>
          </div>

          {/* Auto-detect button */}
          <button
            onClick={handleDetectLocation}
            className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 mb-6"
          >
            <Navigation className="h-5 w-5" />
            <span className="font-medium">Detect My Location</span>
          </button>

          {/* Locations list */}
          <div className="space-y-2">
            <h4 className="text-body font-semibold text-text-primary mb-3">Available Locations</h4>
            
            {locationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading locations...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No locations available</p>
              </div>
            ) : (
              locations.map((location) => {
                const locationDisplay = `${location.name}, ${location.city}, ${location.province}`;
                return (
                  <button
                    key={location.id}
                    onClick={() => onLocationSelect(locationDisplay)}
                    disabled={loading}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      locationDisplay === currentLocation
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50 text-text-primary'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-500">
                          {location.city}, {location.province}, {location.country}
                        </div>
                      </div>
                      {loading && locationDisplay !== currentLocation && (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
