
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock,
  Trash2
} from 'lucide-react';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      type: 'service',
      serviceName: 'Premium House Cleaning',
      providerName: 'CleanPro Services',
      rating: 4.8,
      reviews: 124,
      price: 75,
      duration: '2-3 hours',
      location: 'Downtown Moncton',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      type: 'provider',
      providerName: 'Style Studio Hair Salon',
      rating: 4.9,
      reviews: 89,
      services: ['Hair Cut', 'Hair Styling', 'Hair Color'],
      location: 'Riverview',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      type: 'service',
      serviceName: 'AC Installation & Repair',
      providerName: 'CoolTech Services',
      rating: 4.7,
      reviews: 56,
      price: 120,
      duration: '1-2 hours',
      location: 'Saint John',
      image: '/placeholder.svg'
    }
  ]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your favorites</h2>
          <p className="text-gray-600 mb-6">Save your preferred services and providers</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Your saved services and providers</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={favorite.type === 'service' ? 'default' : 'secondary'}>
                    {favorite.type === 'service' ? 'Service' : 'Provider'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {favorite.type === 'service' ? favorite.serviceName : favorite.providerName}
                  </h3>
                  
                  {favorite.type === 'service' && (
                    <p className="text-gray-600">{favorite.providerName}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{favorite.rating}</span>
                      <span className="text-gray-500">({favorite.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{favorite.location}</span>
                    </div>
                  </div>

                  {favorite.type === 'service' && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{favorite.duration}</span>
                      </div>
                      <p className="text-lg font-bold text-primary">${favorite.price}</p>
                    </div>
                  )}

                  {favorite.type === 'provider' && favorite.services && (
                    <div className="flex flex-wrap gap-1">
                      {favorite.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {favorite.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{favorite.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button className="flex-1" size="sm">
                    Book Now
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">Save services and providers you love for quick access</p>
          <Button onClick={() => window.location.href = '/'}>
            Browse Services
          </Button>
        </div>
      )}
    </div>
  );
}
