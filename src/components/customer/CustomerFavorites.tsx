
import React, { useState } from 'react';
import { Heart, Star, MapPin, Phone, Search, Filter, Calendar, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const CustomerFavorites = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const favorites = [
    {
      id: 1,
      name: 'John Smith',
      service: 'Plumbing Services',
      category: 'Home Maintenance',
      rating: 4.9,
      reviews: 156,
      distance: '2.3 km away',
      phone: '(506) 555-0123',
      price: 85,
      specialties: ['Emergency Repairs', 'Installations', 'Maintenance'],
      availability: 'Available Today',
      lastBooked: '2 weeks ago',
      image: ''
    },
    {
      id: 2,
      name: 'Maria Garcia',
      service: 'House Cleaning',
      category: 'Cleaning',
      rating: 4.8,
      reviews: 203,
      distance: '1.8 km away',
      phone: '(506) 555-0456',
      price: 120,
      specialties: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/out'],
      availability: 'Available Tomorrow',
      lastBooked: '1 week ago',
      image: ''
    },
    {
      id: 3,
      name: 'Green Thumb Co.',
      service: 'Garden & Landscaping',
      category: 'Landscaping',
      rating: 4.7,
      reviews: 89,
      distance: '3.1 km away',
      phone: '(506) 555-0789',
      price: 200,
      specialties: ['Lawn Care', 'Tree Trimming', 'Garden Design'],
      availability: 'Available Next Week',
      lastBooked: '1 month ago',
      image: ''
    },
    {
      id: 4,
      name: 'Tech Solutions Pro',
      service: 'Computer Repair',
      category: 'Technology',
      rating: 4.9,
      reviews: 124,
      distance: '1.2 km away',
      phone: '(506) 555-0321',
      price: 95,
      specialties: ['Hardware Repair', 'Software Issues', 'Data Recovery'],
      availability: 'Available Today',
      lastBooked: '3 days ago',
      image: ''
    }
  ];

  const categories = ['All', ...new Set(favorites.map(f => f.category))];

  const filteredFavorites = favorites.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || provider.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const removeFavorite = (id: number) => {
    // In a real app, this would make an API call
    console.log('Removing favorite:', id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorite Services</h1>
          <p className="text-gray-600">
            Your trusted service providers for quick and easy booking
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Heart className="h-4 w-4 text-pink-500" />
          {favorites.length} saved services
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your favorite services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className={`${
                    categoryFilter === category 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((provider) => (
            <Card key={provider.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={provider.image} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                        {provider.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {provider.name}
                      </h3>
                      <p className="text-gray-600 font-medium mb-2">
                        {provider.service}
                      </p>
                      <Badge variant="secondary" className="mb-3">
                        {provider.category}
                      </Badge>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium text-gray-900">{provider.rating}</span>
                          <span className="text-gray-500">({provider.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(provider.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500">Availability</p>
                    <p className="font-medium text-gray-900">{provider.availability}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last booked</p>
                    <p className="font-medium text-gray-900">{provider.lastBooked}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{provider.phone}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-2xl font-bold text-gray-900">${provider.price}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || categoryFilter !== 'All' ? 'No favorites found' : 'No favorites yet'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== 'All' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start adding services to your favorites for quick access and easy rebooking.'
                  }
                </p>
                {searchTerm || categoryFilter !== 'All' ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg">
                    <Search className="h-5 w-5 mr-2" />
                    Discover Services
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
