import React, { useState } from 'react';
import { useLocations, Location } from '@/hooks/useLocations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Save, 
  X,
  Loader2
} from 'lucide-react';

interface LocationFormData {
  name: string;
  city: string;
  province: string;
  country: string;
  is_active: boolean;
}

export const LocationManagement: React.FC = () => {
  const { locations, loading, createLocation, updateLocation, deleteLocation } = useLocations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    city: '',
    province: '',
    country: 'Canada',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      province: '',
      country: 'Canada',
      is_active: true
    });
    setEditingLocation(null);
    setIsFormOpen(false);
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      city: location.city,
      province: location.province,
      country: location.country,
      is_active: location.is_active
    });
    setEditingLocation(location);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteLocation(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Location Management</h2>
          <p className="text-gray-600 mt-2">Manage service locations for your platform</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Location Form */}
      {isFormOpen && (
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-primary w-full"
                    placeholder="e.g., Downtown Moncton"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-primary w-full"
                    placeholder="e.g., Moncton"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province/State
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="input-primary w-full"
                    placeholder="e.g., NB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-primary w-full"
                    required
                  >
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active Location
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingLocation ? 'Update' : 'Create'} Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="icon-container bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{location.name}</h4>
                    <p className="text-sm text-gray-600">
                      {location.city}, {location.province}
                    </p>
                  </div>
                </div>
                <Badge className={location.is_active ? 'status-success' : 'status-error'}>
                  {location.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Country: {location.country}</p>
                <p>Created: {new Date(location.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(location)}
                  className="btn-secondary flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(location.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <Card className="card-primary">
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first service location to get started.
            </p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};