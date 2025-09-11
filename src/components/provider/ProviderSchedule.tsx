import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProviderSchedule = () => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  // Mock schedule data
  const [schedule, setSchedule] = useState({
    monday: [
      { id: '1', start: '09:00', end: '12:00', available: true },
      { id: '2', start: '13:00', end: '17:00', available: true }
    ],
    tuesday: [
      { id: '3', start: '09:00', end: '12:00', available: true },
      { id: '4', start: '13:00', end: '17:00', available: true }
    ],
    wednesday: [
      { id: '5', start: '09:00', end: '12:00', available: true },
      { id: '6', start: '13:00', end: '17:00', available: true }
    ],
    thursday: [
      { id: '7', start: '09:00', end: '12:00', available: true },
      { id: '8', start: '13:00', end: '17:00', available: true }
    ],
    friday: [
      { id: '9', start: '09:00', end: '12:00', available: true },
      { id: '10', start: '13:00', end: '17:00', available: true }
    ],
    saturday: [
      { id: '11', start: '10:00', end: '14:00', available: true }
    ],
    sunday: []
  });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const addTimeSlot = (day: string) => {
    const newSlot = {
      id: Date.now().toString(),
      start: '09:00',
      end: '17:00',
      available: true
    };
    
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot]
    }));
    setEditingSlot(newSlot.id);
  };

  const updateTimeSlot = (day: string, slotId: string, updates: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    }));
  };

  const deleteTimeSlot = (day: string, slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(slot => slot.id !== slotId)
    }));
  };

  const toggleAvailability = (day: string, slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map(slot => 
        slot.id === slotId ? { ...slot, available: !slot.available } : slot
      )
    }));
  };

  const getTotalHours = () => {
    return Object.values(schedule).reduce((total: number, daySlots: any) => {
      return total + (daySlots as any).reduce((dayTotal: number, slot: any) => {
        if (!slot.available) return dayTotal;
        const start = new Date(`2000-01-01T${slot.start}:00`);
        const end = new Date(`2000-01-01T${slot.end}:00`);
        return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule & Availability</h1>
          <p className="text-gray-600 mt-1">Manage your working hours and availability</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Weekly Hours</p>
            <p className="text-2xl font-bold text-blue-600">{getTotalHours()}h</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Working Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(schedule).filter(slots => slots.length > 0).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(schedule).reduce((total, slots) => 
                    total + slots.filter(slot => slot.available).length, 0
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Daily Hours</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(getTotalHours() / 7).toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Available</p>
                <p className="text-lg font-bold text-blue-600">Today 2PM</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Management */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Day Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Days of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedDay === day.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{day.label}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {schedule[day.key].length} slots
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {days.find(d => d.key === selectedDay)?.label} Schedule
              </CardTitle>
              <Button
                onClick={() => addTimeSlot(selectedDay)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule[selectedDay].length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first time slot for {days.find(d => d.key === selectedDay)?.label}
                  </p>
                  <Button
                    onClick={() => addTimeSlot(selectedDay)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              ) : (
                schedule[selectedDay].map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 border rounded-lg ${
                      slot.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {editingSlot === slot.id ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(selectedDay, slot.id, { start: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(selectedDay, slot.id, { end: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingSlot(null)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSlot(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                          <Badge
                            className={
                              slot.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {slot.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAvailability(selectedDay, slot.id)}
                          >
                            {slot.available ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSlot(slot.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTimeSlot(selectedDay, slot.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center space-y-2"
              onClick={() => {
                // Copy Monday schedule to all weekdays
                const mondaySchedule = schedule.monday;
                setSchedule(prev => ({
                  ...prev,
                  tuesday: [...mondaySchedule],
                  wednesday: [...mondaySchedule],
                  thursday: [...mondaySchedule],
                  friday: [...mondaySchedule]
                }));
              }}
            >
              <Calendar className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Copy to Weekdays</span>
              <span className="text-xs text-gray-500">Apply Monday schedule to Tue-Fri</span>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center space-y-2"
              onClick={() => {
                // Clear all schedules
                setSchedule({
                  monday: [], tuesday: [], wednesday: [], thursday: [],
                  friday: [], saturday: [], sunday: []
                });
              }}
            >
              <X className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium">Clear All</span>
              <span className="text-xs text-gray-500">Remove all time slots</span>
            </Button>

            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center space-y-2"
              onClick={() => {
                // Set standard business hours
                const businessHours = [
                  { id: Date.now().toString(), start: '09:00', end: '17:00', available: true }
                ];
                setSchedule({
                  monday: [...businessHours],
                  tuesday: [...businessHours],
                  wednesday: [...businessHours],
                  thursday: [...businessHours],
                  friday: [...businessHours],
                  saturday: [],
                  sunday: []
                });
              }}
            >
              <Clock className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">Standard Hours</span>
              <span className="text-xs text-gray-500">9 AM - 5 PM, Mon-Fri</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};